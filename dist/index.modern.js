const Levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
const COMBO_ENV_DELIMITER = '|';
const NAME_DELIMITER = ':';

function isString(arg) {
  return arg?.constructor === String;
}

function isError(arg) {
  return arg instanceof Error;
}

class Logger {
  constructor(context = {}) {
    if (isString(context)) {
      context = {
        name: context
      };
    }

    if (!('name' in context)) {
      throw new Error('Must specify name for logger');
    }

    this.context = context;
    const {
      name
    } = context;
    this.name = name;
  }

  static set time(fn) {
    this._time = fn;
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

  static readConfig() {
    function getConfig(key) {
      let config;

      if (typeof process !== 'undefined') {
        config = process.env?.[key];

        if (config) {
          return config;
        }
      }

      if (typeof window !== 'undefined') {
        config = window.localStorage?.[key];

        if (config) {
          return config;
        }
      }

      return null;
    }

    const combo = getConfig('LOGGER');

    if (combo) {
      const parts = combo.split(COMBO_ENV_DELIMITER);

      if (parts.length > 1) {
        const [level, names] = parts;
        this.level = level;
        this.names = names;
      } else {
        this.names = combo;
      }
    } else {
      const level = getConfig('LOGGER_LEVEL');

      if (level) {
        this.level = level;
      }

      const names = getConfig('LOGGER_NAMES');

      if (names) {
        this.names = names;
      }
    }
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
    if (isString(context)) {
      context = {
        name: context
      };
    }

    let {
      name
    } = this.context;

    if ('name' in context) {
      name = [name, context.name].join(NAME_DELIMITER);
    }

    const new_context = { ...this.context,
      ...context,
      name
    };
    const child = new this.constructor(new_context);
    child.level = this.level;
    return child;
  }

  _log(...args) {
    let body = { ...this.context
    };

    for (const arg of args) {
      const has_message = ('message' in body);

      if (isString(arg)) {
        if (!has_message) {
          body.message = arg;
        }
      } else if (isError(arg)) {
        if (!has_message) {
          body.message = arg.message;
        }

        const props = Object.getOwnPropertyNames(arg);
        const payload = props.reduce((payload, key) => {
          payload[key] = arg[key];
          return payload;
        }, {});
        body.error = JSON.stringify(payload);
      } else if (arg) {
        body = { ...body,
          ...arg
        };
      }
    }

    if (!('time' in body)) {
      body.time = this.constructor._time();
    }

    return body;
  }

}
Logger.includes = [];
Logger.excludes = [];
Logger._level = 'info';

Logger._time = function () {
  return new Date().toISOString();
};

Logger.levels = Levels;
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
Logger.readConfig();

export default Logger;
//# sourceMappingURL=index.modern.js.map
