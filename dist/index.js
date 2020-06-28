function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

const Levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
const NAME_DELIMITER = ':';

function isString(arg) {
  return (arg == null ? void 0 : arg.constructor) === String;
}

function isError(arg) {
  return arg instanceof Error;
}

class Logger {
  constructor(context = {}) {
    this.context = context;

    if (!('name' in context)) {
      throw new Error('Must specify name for logger');
    }

    const {
      name
    } = context;
    this.name = name;
    this.names = name.split(NAME_DELIMITER);
  }

  static enabled({
    level,
    name
  }) {
    return this.levelEnabled(level) && this.nameEnabled(name);
  }

  static levelEnabled(level) {
    const level_index = Levels.indexOf(level);
    const this_index = Levels.indexOf(this.level);
    return level_index >= this_index;
  }

  static nameEnabled(name) {
    if (name === '*') {
      return true;
    }

    for (const exclude of this.excludes) {
      if (exclude.test(name)) {
        return false;
      }
    }

    return this.includes.some(include => {
      return include.test(name);
    });
  }

  static get level() {
    return this._level;
  }

  static set level(level) {
    const valid_level = Levels.includes(level);

    if (!valid_level) {
      throw new Error(`Invalid level ${level}`);
    }

    this._level = level;
  }

  static set names(names) {
    if (!Array.isArray(names)) {
      if (isString(names)) {
        names = names.split(/[\s,]+/);
      } else {
        throw new Error('setNames expects string or array or strings');
      }
    }

    for (let name of names) {
      name = name.replace(/\*/g, '.*?');
      const exclude = name[0] === '-';
      let dest = 'includes';

      if (exclude) {
        name = name.substr(1);
        dest = 'excludes';
      }

      const regex = new RegExp(`^${name}$`);
      this[dest].push(regex);
    }
  }

  child(context = {}) {
    let {
      name
    } = this.context;

    if ('name' in context) {
      name = [name, context.name].join(NAME_DELIMITER);
    }

    const new_context = _extends({}, this.context, context, {
      name
    });

    const child = new this.constructor(new_context);
    child.level = this.level;
    return child;
  }

  _log(...args) {
    let body = _extends({}, this.context);

    for (const arg of args) {
      const has_message = ('message' in body);

      if (isString(arg)) {
        if (!has_message) {
          body.message = arg;
        }
      } else if (isError(arg)) {
        body.error = arg;

        if (!has_message) {
          body.message = arg.message;
        }
      } else if (arg) {
        body = _extends({}, body, arg);
      }
    }

    return body;
  }

}
Logger.includes = [];
Logger.excludes = [];
Logger._level = 'info';
Levels.forEach(level => {
  const {
    console
  } = global;
  const fn = level === 'fatal' ? 'error' : level;

  Logger.prototype[level] = function log(...args) {
    const body = this._log(...args);

    const {
      message,
      name
    } = body;
    const enabled = Logger.enabled({
      level,
      name
    });

    if (enabled) {
      console[fn](message, body);
    }
  };

  Levels[level] = level;
});
Logger.levels = Levels;

module.exports = Logger;
//# sourceMappingURL=index.js.map
