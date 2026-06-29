var MeowMailLogger = (function () {
  var LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, NONE: 4 };
  var currentLevel = 'INFO';

  function setLevel(level) {
    if (LEVELS[level] !== undefined) {
      currentLevel = level;
    }
  }

  function log(level, args) {
    if (LEVELS[level] === undefined) return;
    if (LEVELS[level] < LEVELS[currentLevel]) return;
    var prefix = '[MeowMail][' + level + ']';
    var message = args;
    if (typeof args === 'string') {
      for (var i = 2; i < arguments.length; i++) {
        message = message.replace(/%s/, arguments[i]);
      }
    }
    Logger.log(prefix + ' ' + message);
  }

  function debug(msg) { log('DEBUG', msg); }
  function info(msg) { log('INFO', msg); }
  function warn(msg) { log('WARN', msg); }
  function error(msg) { log('ERROR', msg); }

  return {
    setLevel: setLevel,
    debug: debug,
    info: info,
    warn: warn,
    error: error
  };
})();
