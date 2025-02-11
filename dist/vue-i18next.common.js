'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var deepmerge = _interopDefault(require('deepmerge'));

var component = {
  name: 'i18next',
  functional: true,
  props: {
    tag: {
      type: String,
      default: 'span',
    },
    path: {
      type: String,
      required: true,
    },
    options: {
      type: Object,
    },
  },
  render: function render(h, ref) {
    var props = ref.props;
    var data = ref.data;
    var children = ref.children;
    var parent = ref.parent;

    var i18next = parent.$i18n;
    if (!i18next) {
      return h(props.tag, data, children);
    }

    var path = props.path;
    var options = props.options || {};

    var REGEXP = i18next.i18next.services.interpolator.regexp;
    var format = i18next.t(path, Object.assign({}, options, {interpolation: { prefix: '#$?', suffix: '?$#' }}));
    var tchildren = [];

    format.split(REGEXP).reduce(function (memo, match, index) {
      var child;
      if (index % 2 === 0) {
        if (match.length === 0) { return memo; }

        child = match;
      } else {
        var place = match.trim();
        if (isNaN(parseFloat(place)) || !isFinite(place)) {
          children.forEach(function (e) {
            if (!child && e.data.attrs && e.data.attrs.place && e.data.attrs.place === place) {
              child = e;
            }
          });
        } else {
          child = children[parseInt(match, 10)];
        }
      }

      memo.push(child);
      return memo;
    }, tchildren);

    return h(props.tag, data, tchildren);
  },
};

/* eslint-disable import/prefer-default-export */

function log(message) {
  if (typeof console !== 'undefined') {
    console.warn(message); // eslint-disable-line no-console
  }
}

function warn(message) {
  log(("[vue-i18next warn]: " + message));
}

function deprecate(message) {
  log(("[vue-i18next deprecated]: " + message));
}

/* eslint-disable no-param-reassign, no-unused-vars */

function equalLanguage(el, vnode) {
  var vm = vnode.context;
  return el._i18nLanguage === vm.$i18n.i18next.language;
}

function equalValue(value, oldValue) {
  if (value === oldValue) {
    return true;
  } else if (value && oldValue) {
    return (
      value.path === oldValue.path &&
      value.language === oldValue.language &&
      value.args === oldValue.args
    );
  }
}

function assert(vnode) {
  var vm = vnode.context;

  if (!vm.$i18n) {
    warn('No VueI18Next instance found in the Vue instance');
    return false;
  }

  return true;
}

function parseValue(value) {
  var path;
  var language;
  var args;

  if (typeof value === 'string') {
    path = value;
  } else if (Object.prototype.toString.call(value) === '[object Object]') {
    path = value.path;
    language = value.language;
    args = value.args;
  }

  return { path: path, language: language, args: args };
}

function t(el, binding, vnode) {
  var value = binding.value;

  var ref = parseValue(value);
  var path = ref.path;
  var language = ref.language;
  var args = ref.args;
  if (!path && !language && !args) {
    warn('v-t: invalid value');
    return;
  }

  if (!path) {
    warn('v-t: "path" is required');
    return;
  }

  if (language) {
    deprecate("v-t: \"language\" is deprecated.Use the \"lng\" property in args.\n      https://www.i18next.com/overview/configuration-options#configuration-options");
  }

  var vm = vnode.context;
  el.textContent = vm.$i18n.i18next.t(path, Object.assign({}, (language ? { lng: language } : {}), args));

  el._i18nLanguage = vm.$i18n.i18next.language;
}

function bind(el, binding, vnode) {
  if (!assert(vnode)) {
    return;
  }

  t(el, binding, vnode);
}

function update(el, binding, vnode, oldVNode) {
  if (equalLanguage(el, vnode) && equalValue(binding.value, binding.oldValue)) {
    return;
  }

  t(el, binding, vnode);
}

var directive = {
  bind: bind,
  update: update,
};

/* eslint-disable no-param-reassign, no-unused-vars */

function assert$1(vnode) {
  var vm = vnode.context;

  if (!vm.$i18n) {
    warn('No VueI18Next instance found in the Vue instance');
    return false;
  }

  return true;
}

function waitForIt(el, vnode) {
  if (vnode.context.$i18n.i18next.isInitialized) {
    el.hidden = false;
  } else {
    el.hidden = true;
    var initialized = function () {
      vnode.context.$forceUpdate();
      // due to emitter removing issue in i18next we need to delay remove
      setTimeout(function () {
        if (vnode.context && vnode.context.$i18n) {
          vnode.context.$i18n.i18next.off('initialized', initialized);
        }
      }, 1000);
    };
    vnode.context.$i18n.i18next.on('initialized', initialized);
  }
}

function bind$1(el, binding, vnode) {
  if (!assert$1(vnode)) {
    return;
  }

  waitForIt(el, vnode);
}

function update$1(el, binding, vnode, oldVNode) {
  if (vnode.context.$i18n.i18next.isInitialized) {
    el.hidden = false;
  }
}

var waitDirective = {
  bind: bind$1,
  update: update$1,
};

/* eslint-disable import/no-mutable-exports */

var Vue;

function install(_Vue) {
  if (install.installed) {
    return;
  }
  install.installed = true;

  Vue = _Vue;

  var getByKey = function (i18nOptions, i18nextOptions) { return function (key) {
    if (
        i18nOptions &&
        i18nOptions.keyPrefix &&
        !key.includes(i18nextOptions.nsSeparator)
      ) {
      return ((i18nOptions.keyPrefix) + "." + key);
    }
    return key;
  }; };

  var getComponentNamespace = function (vm) {
    var namespace = vm.$options.name || vm.$options._componentTag;
    if (namespace) {
      return {
        namespace: namespace,
        loadNamespace: true,
      };
    }

    return {
      namespace: ("" + (Math.random())),
    };
  };

  Vue.mixin({
    beforeCreate: function beforeCreate() {
      var this$1 = this;

      var options = this.$options;
      if (options.i18n) {
        this._i18n = options.i18n;
      } else if (options.parent && options.parent.$i18n) {
        this._i18n = options.parent.$i18n;
      }
      var inlineTranslations = {};

      if (this._i18n) {
        var getNamespace =
          this._i18n.options.getComponentNamespace || getComponentNamespace;
        var ref = getNamespace(this);
        var namespace = ref.namespace;
        var loadNamespace = ref.loadNamespace;

        if (options.__i18n) {
          options.__i18n.forEach(function (resource) {
            inlineTranslations = deepmerge(
              inlineTranslations,
              JSON.parse(resource)
            );
          });
        }

        if (options.i18nOptions) {
          var ref$1 = this.$options.i18nOptions;
          var lng = ref$1.lng; if ( lng === void 0 ) lng = null;
          var keyPrefix = ref$1.keyPrefix; if ( keyPrefix === void 0 ) keyPrefix = null;
          var messages = ref$1.messages;
          var ref$2 = this.$options.i18nOptions;
          var namespaces = ref$2.namespaces;
          namespaces = namespaces || this._i18n.i18next.options.defaultNS;

          if (typeof namespaces === 'string') { namespaces = [namespaces]; }
          var namespacesToLoad = namespaces.concat([namespace]);

          if (messages) {
            inlineTranslations = deepmerge(inlineTranslations, messages);
          }

          this._i18nOptions = { lng: lng, namespaces: namespacesToLoad, keyPrefix: keyPrefix };
          this._i18n.i18next.loadNamespaces(namespaces);
        } else if (options.parent && options.parent._i18nOptions) {
          this._i18nOptions = Object.assign({}, options.parent._i18nOptions);
          this._i18nOptions.namespaces = [
            namespace ].concat( this._i18nOptions.namespaces );
        } else if (options.__i18n) {
          this._i18nOptions = { namespaces: [namespace] };
        }

        if (loadNamespace && this._i18n.options.loadComponentNamespace) {
          this._i18n.i18next.loadNamespaces([namespace]);
        }

        var languages = Object.keys(inlineTranslations);
        languages.forEach(function (lang) {
          this$1._i18n.i18next.addResourceBundle(
            lang,
            namespace,
            Object.assign({}, inlineTranslations[lang]),
            true,
            false
          );
        });
      }

      var getKey = getByKey(
          this._i18nOptions,
          this._i18n ? this._i18n.i18next.options : {}
        );

      if (this._i18nOptions && this._i18nOptions.namespaces) {
        var ref$3 = this._i18nOptions;
        var lng$1 = ref$3.lng;
        var namespaces$1 = ref$3.namespaces;

        var fixedT = this._i18n.i18next.getFixedT(lng$1, namespaces$1);
        this._getI18nKey = function (key, i18nextOptions) { return fixedT(getKey(key), i18nextOptions, this$1._i18n.i18nLoadedAt); };
      } else {
        this._getI18nKey = function (key, i18nextOptions) { return this$1._i18n.t(getKey(key), i18nextOptions, this$1._i18n.i18nLoadedAt); };
      }
    },
  });

  // extend Vue.js
  Object.defineProperty(Vue.prototype, '$i18n', {
    get: function get() { return this._i18n; },
  });

  Vue.prototype.$t = function t(key, options) {
    return this._getI18nKey(key, options);
  };

  Vue.component(component.name, component);
  Vue.directive('t', directive);
  Vue.directive('waitForT', waitDirective);
}

var VueI18n = function VueI18n(i18next, opts) {
  if ( opts === void 0 ) opts = {};

  var options = Object.assign({}, {bindI18n: 'languageChanged loaded',
    bindStore: 'added removed',
    loadComponentNamespace: false},
    opts);

  this._vm = null;
  this.i18next = i18next;
  this.options = options;

  this.onI18nChanged = this.onI18nChanged.bind(this);

  if (options.bindI18n) {
    this.i18next.on(options.bindI18n, this.onI18nChanged);
  }
  if (options.bindStore && this.i18next.store) {
    this.i18next.store.on(options.bindStore, this.onI18nChanged);
  }

  this.resetVM({ i18nLoadedAt: new Date() });
};

var prototypeAccessors = { i18nLoadedAt: { configurable: true } };

VueI18n.prototype.resetVM = function resetVM (data) {
  var oldVM = this._vm;
  var silent = Vue.config.silent;
  Vue.config.silent = true;
  this._vm = new Vue({ data: data });
  Vue.config.silent = silent;
  if (oldVM) {
    Vue.nextTick(function () { return oldVM.$destroy(); });
  }
};

prototypeAccessors.i18nLoadedAt.get = function () {
  return this._vm.$data.i18nLoadedAt;
};
prototypeAccessors.i18nLoadedAt.set = function (date) {
  this._vm.$set(this._vm, 'i18nLoadedAt', date);
};

VueI18n.prototype.t = function t (key, options) {
  return this.i18next.t(key, options);
};

VueI18n.prototype.onI18nChanged = function onI18nChanged () {
  this.i18nLoadedAt = new Date();
};

Object.defineProperties( VueI18n.prototype, prototypeAccessors );

VueI18n.install = install;
VueI18n.version = "0.4.0-development";

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VueI18n);
}

module.exports = VueI18n;
