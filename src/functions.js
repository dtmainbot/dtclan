const chalk = require("chalk");

/**
 * Logs a message with optional styling.
 *
 * @param {string} string - The message to log.
 * @param {'info' | 'err' | 'warn' | 'done' | undefined} style - The style of the log.
 */
const log = (string, style) => {
  const styles = {
    info: { prefix: chalk.blue("(info)==>"), logFunction: console.log },
    err: { prefix: chalk.red("(error)==>"), logFunction: console.error },
    warn: { prefix: chalk.yellow("(warning)==>)"), logFunction: console.warn },
    done: { prefix: chalk.green("(succes)==>"), logFunction: console.log },
  };

  const selectedStyle = styles[style] || { logFunction: console.log };
  selectedStyle.logFunction(`${selectedStyle.prefix || ""} ${string}`);
};

/**
 * Formats a timestamp.
 *
 * @param {number} time - The timestamp in milliseconds.
 * @param {import('discord.js').TimestampStylesString} style - The timestamp style.
 * @returns {string} - The formatted timestamp.
 */
const time = (time, style) => {
  return `<t:${Math.floor(time / 1000)}${style ? `:${style}` : ""}>`;
};

module.exports = {
  log,
  time,
};
