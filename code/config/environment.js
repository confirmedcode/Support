const Logger = require("shared/logger");

// Load environment variables
require("shared/environment")([
  "COMMON",
  "SUPPORT"
]);

// Load database login
process.env.PG_USER = "support";
process.env.PG_PASSWORD = process.env.PG_SUPPORT_PASSWORD;