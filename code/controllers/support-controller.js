const ConfirmedError = require("shared/error");
const Logger = require("shared/logger");

// Middleware
const authenticate = require("../middleware/authenticate.js");
const {
  body
} = require("express-validator/check");
const validateCheck = require("../middleware/validate-check.js");

// Utilities
const {
  Secure
} = require("shared/utilities");
const {
  Email
} = require("shared/utilities");
const {
  Stripe
} = require("shared/utilities");
const rp = require("request-promise");
const aws = require("aws-sdk");
const cloudwatchlogs = new aws.CloudWatchLogs();

// Models
const {
  SupportUser
} = require("shared/models");
const {
  User
} = require("shared/models");

const ENVIRONMENT = process.env.ENVIRONMENT;
const EMAIL_SALT = process.env.EMAIL_SALT;

// Routes
const router = require("express").Router();

/*********************************************
 *
 * Support Page
 *
 *********************************************/

router.get("/support",
  authenticate,
  (request, response, next) => {
    response.render("support");
  });

/*********************************************
 *
 * Get Information
 *
 *********************************************/

router.post("/get-subscriptions-with-email",
  [
    authenticate,
    body("email")
    .not().isEmpty().withMessage("Missing email address.")
    .isEmail().withMessage("Invalid email address.")
    .normalizeEmail({
      gmail_remove_dots: false
    }),
    body("reason")
    .not().isEmpty().withMessage("A reason for this request is required."),
    validateCheck
  ],
  (request, response, next) => {
    var email = request.values.email;
    var reason = request.values.reason;
    return Email.sendAuditAlert(email, "Look up user's subscriptions.", reason)
      .then(success => {
        return User.getWithEmail(email, "id");
      })
      .then(user => {
        return user.getSubscriptions();
      })
      .then(subscriptions => {
        subscriptions.forEach(function (v) {
          delete v.receiptDataEncrypted
        });
        response.status(200).json({
          subscriptions: JSON.stringify(subscriptions, null, 2)
        });
      })
      .catch(error => {
        next(error);
      });
  });

router.post("/get-active-subscriptions-with-email",
  [
    authenticate,
    body("email")
    .not().isEmpty().withMessage("Missing email address.")
    .isEmail().withMessage("Invalid email address.")
    .normalizeEmail({
      gmail_remove_dots: false
    }),
    body("reason")
    .not().isEmpty().withMessage("A reason for this request is required."),
    validateCheck
  ],
  (request, response, next) => {
    var email = request.values.email;
    var reason = request.values.reason;
    return Email.sendAuditAlert(email, "Look up user's active subscriptions.", reason)
      .then(success => {
        return User.getWithEmail(email, "id");
      })
      .then(user => {
        return user.getActiveSubscriptions();
      })
      .then(subscriptions => {
        subscriptions.forEach(function (v) {
          delete v.receiptDataEncrypted
        });
        response.status(200).json({
          subscriptions: JSON.stringify(subscriptions, null, 2)
        });
      })
      .catch(error => {
        next(error);
      });
  });

router.post("/get-user-with-email",
  [
    authenticate,
    body("email")
    .not().isEmpty().withMessage("Missing email address.")
    .isEmail().withMessage("Invalid email address.")
    .normalizeEmail({
      gmail_remove_dots: false
    }),
    body("reason")
    .not().isEmpty().withMessage("A reason for this request is required."),
    validateCheck
  ],
  (request, response, next) => {
    var email = request.values.email;
    var reason = request.values.reason;
    return Email.sendAuditAlert(email, "Look up user's basic registration information.", reason)
      .then(success => {
        return User.getWithEmail(email, "id, stripe_id, create_date, referred_by, delete_date, delete_reason, banned, month_usage_megabytes, month_usage_update, email_confirmed, do_not_email", true);
      })
      .then(user => {
        response.status(200).json({
          subscriptions: JSON.stringify(user, null, 2)
        });
      })
      .catch(error => {
        next(error);
      });
  });

router.post("/get-hashed-email",
  [
    authenticate,
    body("email")
    .not().isEmpty().withMessage("Missing email address.")
    .isEmail().withMessage("Invalid email address.")
    .normalizeEmail({
      gmail_remove_dots: false
    }),
    body("reason")
    .not().isEmpty().withMessage("A reason for this request is required."),
    validateCheck
  ],
  (request, response, next) => {
    var email = request.values.email;
    var reason = request.values.reason;
    // Check that we do have this email in the database
    return User.getWithEmail(email, "id")
      .then(user => {
        // Send email alert to user
        return Email.sendAuditAlert(email, "Look up user hashed email.", reason);
      })
      .then(success => {
        // Return hashed email to support
        var hashedEmail = Secure.hashSha512(email, EMAIL_SALT);
        response.status(200).json({
          hashedEmail: hashedEmail
        });
      })
      .catch(error => {
        next(error);
      });
  });

router.post("/get-email-with-stripe-id",
  [
    authenticate,
    body("stripeId")
    .not().isEmpty().withMessage("Missing stripeId."),
    body("reason")
    .not().isEmpty().withMessage("A reason for this request is required."),
    validateCheck
  ],
  (request, response, next) => {
    var stripeId = request.values.stripeId;
    var reason = request.values.reason;
    // Check that we do have this Stripe ID in the database
    return User.getWithStripeId(stripeId, "id, email, email_encrypted")
      .then(user => {
        // Send email alert to user
        return Email.sendAuditAlert(user.email, "Look up user email using Stripe ID.", reason)
          .then(success => {
            // Return email
            response.status(200).json({
              email: user.email
            });
          });
      })
      .catch(error => {
        next(error);
      });
  });

router.post("/get-email-with-user-id",
  [
    authenticate,
    body("userId")
    .not().isEmpty().withMessage("Missing userId."),
    body("reason")
    .not().isEmpty().withMessage("A reason for this request is required."),
    validateCheck
  ],
  (request, response, next) => {
    var userId = request.values.userId;
    var reason = request.values.reason;
    return User.getWithId(userId, "id, email, email_encrypted", true)
      .then(user => {
        return Email.sendAuditAlert(user.email, "Look up user email using User ID.", reason);
      })
      .then(success => {
        response.status(200).json({
          email: user.email
        });
      })
      .catch(error => {
        next(error);
      });
  });

router.post("/get-stripe-id-with-email",
  [
    authenticate,
    body("email")
    .not().isEmpty().withMessage("Missing email address.")
    .isEmail().withMessage("Invalid email address.")
    .normalizeEmail({
      gmail_remove_dots: false
    }),
    body("reason")
    .not().isEmpty().withMessage("A reason for this request is required."),
    validateCheck
  ],
  (request, response, next) => {
    var email = request.values.email;
    var reason = request.values.reason;
    // Check that we do have this email in the database
    return User.getWithEmail(email, "id, stripe_id")
      .then(user => {
        // Send email alert to user
        return Email.sendAuditAlert(email, "Look up user Stripe ID using email.", reason)
          .then(success => {
            // Return Stripe ID to support
            response.status(200).json({
              stripeId: user.stripeId
            });
          });
      })
      .catch(error => {
        next(error);
      });
  });

/*********************************************
 *
 * Delete User
 *
 *********************************************/

router.post("/delete-user-with-email",
[
  authenticate,
  body("email")
  .exists().withMessage("Missing email address.")
  .isEmail().withMessage("Invalid email address.")
  .normalizeEmail(),
  body("reason")
  .exists().withMessage("A reason for deletion is required.")
  .not().isEmpty().withMessage("A reason for deletion is required."),
  body("banned")
  .isBoolean(),
  validateCheck
],
(request, response, next) => {
  var email = request.values.email;
  var reason = request.values.reason;
  var banned = request.values.banned;

  // Check that we do have this email in the database
  return User.getWithEmail(email, "id, stripe_id, create_date, referred_by, delete_date, delete_reason, banned, month_usage_megabytes, month_usage_update, email_confirmed, do_not_email", true)
    .then(user => {
      // Send email alert to user
      return Email.sendAuditAlert(email, "Delete user account and cancel all desktop subscriptions. Any iOS/Android subscriptions must be cancelled separately using the app store.", reason)
      .then(success => {
        // Delete the user
        return user.delete(reason, banned);
      })
      .then(success => {
        Email.sendAdminAlert(`Deleted user: ${email}`,
        `Deleted user: ${email}
        Requestor IP: ${request.ip}
        Time: ${new Date()}`);
        response.status(200).json({
          message: "Deleted user successfully. Any iOS/Android subscriptions must be deleted separately."
        });
      });
    })
    .catch(error => { next(error); });
});

/*********************************************
 *
 * Change Password
 *
 *********************************************/

router.get("/change-password",
  authenticate,
  (request, response, next) => {
    response.render("change-password");
  });

router.post(["/changePassword", "/change-password"],
  [
    authenticate,
    body("currentPassword")
    .not().isEmpty().withMessage("Missing current password.")
    .custom((value, {
      req,
      location,
      path
    }) => {
      return req.user.assertPassword(value);
    }).withMessage("Current password is incorrect."),
    body("newPassword")
    .exists().withMessage("Missing new password.")
    .not().isEmpty().withMessage("Missing new password.")
    .isLength({
      min: 8,
      max: 50
    }).withMessage("New password must be at least 8 characters long."),
    validateCheck
  ],
  (request, response, next) => {
    const currentPassword = request.values.currentPassword;
    const newPassword = request.values.newPassword;
    return request.user.changePassword(currentPassword, newPassword)
      .then(success => {
        request.flashRedirect("success", "Password changed successfully.", "/support");
      })
      .catch(error => {
        next(error);
      });
  });

module.exports = router;
