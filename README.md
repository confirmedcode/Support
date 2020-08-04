# Support Server

This is a private Node.js Express app that hosts the Support Server `https://support.[domain]`. It contains tools for the Support and Customer Service team to do their work, such as looking up user subscription information. All actions are logged, and every action taken on the Support Server involving a user sends an email notification to the user it affects. It is not viewable to the public and has strict security groups.

- [Prerequisites](#prerequisites)
- [Sign In](#sign-in)
  * [Sign In - Web](#sign-in---web)
  * [Sign In](#sign-in-1)
  * [Log Out (Delete Session)](#log-out--delete-session-)
- [Create Support User](#create-support-user)
  * [Create Support User With Email - Web](#create-support-user-with-email---web)
  * [Create Support User With Email](#create-support-user-with-email)
  * [Confirm Email to Complete Email Signup](#confirm-email-to-complete-email-signup)
  * [Resend Confirmation Email - Web](#resend-confirmation-email---web)
  * [Resend Confirmation Email](#resend-confirmation-email)
- [Support User](#support-user)
  * [Support - Web](#support---web)
  * [Change Support User Password - Web](#change-support-user-password---web)
  * [Change Support User Password](#change-support-user-password)
- [Support Dashboard](#support-dashboard)
  * [Get Subscriptions With Email](#get-subscriptions-with-email)
  * [Get User Info With Email](#get-user-info-with-email)
  * [Get Hashed Email](#get-hashed-email)
  * [Get Email With Stripe ID](#get-email-with-stripe-id)
  * [Get Email With User ID](#get-email-with-user-id)
  * [Get Stripe ID With Email](#get-stripe-id-with-email)
- [Other APIs](#other-apis)
  * [Test Error Logging](#test-error-logging)
  * [Health Check](#health-check)
- [Support](#support)

## Prerequisites

* Run the Support [CloudFormation](https://github.com/confirmedcode/Server-CloudFormation) and all its prerequisites

## Sign In

The `POST /signin` API returns a session cookie. Use the cookie on requests that require authentication. Usually, your HTTP request framework will automatically save this cookie. If the cookie expires or server returns 401, request a new cookie.

### Sign In - Web
__Request__

```
GET /signin
```

### Sign In
__Request__

```
POST /signin
```

Name | Type | Description
--- | --- | ---
`email` | `string` | __Required__ User email.
`password` | `string` | __Required__ User password.

__Response__

```
Set-Cookie: <Cookie with Expiration Time>
```

### Log Out (Delete Session)
__Request__
```
GET /logout
```

__Response__

```
Redirects to /signin
```

## Create Support User

### Create Support User With Email - Web
__Request__

```
GET /signup
```

### Create Support User With Email
__Request__

```
POST /signup
```

Name | Type | Description
--- | --- | ---
`email` | `string` | __Required__ Email to use to create the user. It must end in the same domain as the current service's domain.
`password` | `string` | __Required__ User password.

__Response__

```
Redirect to /signup-success
```

### Confirm Email to Complete Email Signup
__Request__

```
GET /confirm-email
```

Name | Type | Description
--- | --- | ---
`code` | `string` | __Required__ Code that confirms a user is the owner of an email address to complete email signup.

__Response__

```
Redirect to /signin
```

### Resend Confirmation Email - Web
__Request__

```
GET /resend-confirm-code
```

### Resend Confirmation Email
__Request__

```
POST /resend-confirm-code
```

Name | Type | Description
--- | --- | ---
`email` | `string` | __Required__ Email to resend confirmation code to.

__Response__

```
Redirect to /signin
```

## Support User

### Support - Web
__Request__

`Authentication Required`

```
GET /support
```

### Change Support User Password - Web
__Request__

`Authentication Required`

```
GET /change-password
```

### Change Support User Password
__Request__

`Authentication Required`

```
POST /change-password
```

Name | Type | Description
--- | --- | ---
`currentPassword` | `string` | __Required__ User's current password.
`newPassword` | `string` | __Required__ User's new password.

__Response__

```
Redirect to /support
```

## Support Dashboard

### Get Subscriptions With Email

__Request__

`Authentication Required`

```
POST /get-subscriptions-with-email
```

Name | Type | Description
--- | --- | ---
`email` | `string` | __Required__ The email to look up.
`reason` | `string` | __Required__ The reason you are looking upthis user's subscriptions.

__Response__

```
JSON-formatted user subscriptions, with sensitive info filtered out.
```

### Get User Info With Email

__Request__

`Authentication Required`

```
POST /get-user-with-email
```

Name | Type | Description
--- | --- | ---
`email` | `string` | __Required__ The email to look up.
`reason` | `string` | __Required__ The reason you are looking upthis user's subscriptions.

__Response__

```
JSON-formatted user's info, with sensitive info filtered out.
```

### Get Hashed Email
This uses EMAIL_SALT to hash the email in the request.

__Request__

`Authentication Required`

```
POST /get-hashed-email
```

Name | Type | Description
--- | --- | ---
`email` | `string` | __Required__ The email to hash.
`reason` | `string` | __Required__ The reason you are looking up the hash of this user's email.

__Response__

```
{
	hashedEmail: <email hash>
}
```

### Get Email With Stripe ID
__Request__

`Authentication Required`

```
POST /get-email-with-stripe-id
```

Name | Type | Description
--- | --- | ---
`stripeId` | `string` | __Required__ The Stripe Id.
`reason` | `string` | __Required__ The reason you are looking up the hash of this user's email.

__Response__

```
{
	email: <email>
}
```

### Get Email With User ID
__Request__

`Authentication Required`

```
POST /get-email-with-user-id
```

Name | Type | Description
--- | --- | ---
`userId` | `string` | __Required__ The User Id.
`reason` | `string` | __Required__ The reason you are looking up the  user's email.

__Response__

```
{
	email: <email>
}
```


### Get Stripe ID With Email
__Request__

`Authentication Required`

```
POST /get-stripe-id-with-email
```

Name | Type | Description
--- | --- | ---
`email` | `string` | __Required__ The user email.
`reason` | `string` | __Required__ The reason you are looking up the user's Stripe ID.

__Response__

```
{
	stripeId: <Stripe ID>
}
```

## Other APIs

### Test Error Logging
__Request__

```
GET /error-test
```

### Health Check
__Request__

```
GET /health
```

__Response__

```
Status 200
{
	message: "OK from Support"
}
```

## Feedback
If you have any questions, concerns, or other feedback, please let us know any feedback in Github issues or by e-mail.

We also have a bug bounty program -- please email <engineering@confirmedvpn.com> for details.

## License

This project is licensed under the GPL License - see the [LICENSE.md](LICENSE.md) file for details

## Contact

<engineering@confirmedvpn.com>