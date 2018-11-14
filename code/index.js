"use strict";

const app = require("./app.js");
const Logger = require("shared/logger");

app.listen(3000, function() {
  Logger.info("Support - Listening on port 3000");
});