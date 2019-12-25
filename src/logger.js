const chalk = require("chalk");

function logErr(msg) {
  console.log(chalk.red("- ") + msg);
}

function log(msg) {
  console.log(chalk.cyan("- ") + msg);
}

module.exports = {
  log,
  logErr
};
