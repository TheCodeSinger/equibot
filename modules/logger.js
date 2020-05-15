const chalk = require("chalk");
const moment = require("moment");
const { logLevels } = require("../config");

/**
 * Prints a timestamped and colorized message according to log level.
 */
function printLogMessage(content, type) {
  const timestamp = `[${moment().format("YYYY-MM-DD HH:mm:ss")}]:`;
  switch (type) {

    case "debug": {
      if (!logLevels.debug) { return; }
      return console.log(`${timestamp} ${chalk.green(type.toUpperCase())} ${content} `);
    }

    case "log": {
      if (!logLevels.log) { return; }
      return console.log(`${timestamp} ${chalk.bgCyan(type.toUpperCase())} ${content} `);
    }

    case "warn": {
      if (!logLevels.warn) { return; }
      return console.log(`${timestamp} ${chalk.black.bgYellow(type.toUpperCase())} ${content} `);
    }

    case "error": {
      return console.log(`${timestamp} ${chalk.white.bgRed(type.toUpperCase())} ${content} `);
    }

    case "cmd": {
      if (!logLevels.cmd) { return; }
      return console.log(`${timestamp} ${chalk.black.bgWhite(type.toUpperCase())} ${content}`);
    }

    case "ready": {
      return console.log(`${timestamp} ${chalk.black.bgGreen(type.toUpperCase())} ${content}`);
    }

    default: throw new TypeError("Logger type must be either log, warn, error, debug, cmd, or ready.");
  }
}

exports.debug = (...args) => printLogMessage(...args, "debug");
exports.log = (...args) => printLogMessage(...args, "log");
exports.warn = (...args) => printLogMessage(...args, "warn");
exports.error = (...args) => printLogMessage(...args, "error");
exports.cmd = (...args) => printLogMessage(...args, "cmd");
exports.ready = (...args) => printLogMessage(...args, "ready");
