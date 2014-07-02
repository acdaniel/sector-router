/**
 * sector-router v0.3.1
 * A router and utilities for the Sector library
 * https://github.com/acdaniel/sector-router
 *
 * Copyright 2014 Adam Daniel <adam@acdaniel.com>
 * Released under the MIT license
 *
 * Date: 2014-07-02T21:31:42.748Z
 */
!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self);var f=o;f=f.sector||(f.sector={}),f=f.ext||(f.ext={}),f.router=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var sector; try { sector = _dereq_('sector'); } catch (e) { sector = window.sector; }
var pathToRegexp = _dereq_('path-to-regexp');
var zipObject = _dereq_('lodash-node/modern/arrays/zipObject');

module.exports = sector.Component.define({
  type: 'router',
  defaults: {
    navigateRequestTopic: 'ui.navigateRequested',
    protectRouteRequestTopic: 'ui.protectRouteRequested',
    reloadRouteRequestTopic: 'ui.reloadRouteRequested',
    uiReadyTopic: 'ui.ready',
    routeChangedTopic: 'ui.routeChanged',
    confirmRouteChangeRequestTopic: 'ui.confirmRouteChangeRequested',
    routeChangeConfirmedTopic: 'ui.routeChangeConfirmed'
  },
  initialize: function (options) {
    this.routes = [];
    this.protectedRouteFragment = null;
    if (options.routes) {
      for (var path in options.routes) {
        this.addRoute(path, options.routes[path]);
      }
    }
    this.subscribe(this.navigateRequestTopic, this.handleNavigateRequest);
    this.subscribe(this.protectRouteRequestTopic, this.handleProtectRouteRequest);
    this.subscribe(this.routeChangeConfirmedTopic, this.handleRouteChangeConfirmed);
    this.subscribe(this.reloadRouteRequestTopic, this.handleReloadRequest);
    this.listenTo(window, 'hashchange', this.handleHashChange);
    this.subscribe(this.uiReadyTopic, function () {
      this.handleHashChange();
    });
  },
  addRoute: function (route, topic) {
    this.trace('adding named route: ' + topic, route);
    var keys = [];
    var re = pathToRegexp(route, keys);
    this.routes.push({ topic: topic, re: re, keys: keys });
  },
  getFragment: function () {
    return this.parseFragment(window.location.href);
  },
  parseFragment: function (url) {
    var fragment = '', match;
    match = url.match(/#(.*)$/);
    fragment = match ? match[1] : '';
    return fragment;
  },
  lookupRoute: function (fragment) {
    fragment = fragment || '/';
    this.trace('parsing fragment ' + fragment);
    var mapKeyName = function (key) {
      return key.name;
    };
    for (var i = 0, l = this.routes.length; i < l; i++) {
      var route = this.routes[i];
      this.trace('eval route', route);
      var isMatch = route.re.test(fragment);
      if (isMatch) {
        var results = route.re.exec(fragment);
        this.trace('route selected', results);
        var keyNames = route.keys.map(mapKeyName);
        return {
          topic: route.topic,
          data: zipObject(keyNames, results.slice(1))
        };
      }
    }
  },
  handleHashChange: function (event) {
    var fragment, route;
    fragment = this.getFragment();
    if (this.protectedRouteFragment && fragment !== this.protectedRouteFragment) {
      this.publish(this.confirmRouteChangeRequestTopic, { currentRoute: this.protectedRouteFragment, attemptedRoute: fragment });
    } else {
      this.publish(this.routeChangedTopic, { path: fragment || '/' });
      route = this.lookupRoute(fragment);
      if (route) {
        this.publish(route.topic, route.data);
      }
    }
  },
  handleNavigateRequest: function (msg) {
    var path = msg.data ? msg.data : '/';
    if (msg.ignoreProtected) {
      this.protectedRouteFragment = null;
    }
    window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
  },
  handleReloadRequest: function (msg) {
    var path = msg.data ? msg.data : this.getFragment();
    this.stopListening(window, 'hashchange');
    window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
    window.location.reload();
  },
  handleProtectRouteRequest: function (msg) {
    var protect = msg.data !== false ? true : false;
    this.protectedRouteFragment = protect ? this.getFragment() : null;
  },
  handleRouteChangeConfirmed: function (msg) {
    this.protectedRouteFragment = null;
    window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + msg.data.route;
    this.handleHashChange();
  }
});

},{"lodash-node/modern/arrays/zipObject":3,"path-to-regexp":6}],2:[function(_dereq_,module,exports){

exports.mixins = {
};

exports.components = {
  Router: _dereq_('./components/router')
};

},{"./components/router":1}],3:[function(_dereq_,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="node" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isArray = _dereq_('../objects/isArray');

/**
 * Creates an object composed from arrays of `keys` and `values`. Provide
 * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`
 * or two arrays, one of `keys` and one of corresponding `values`.
 *
 * @static
 * @memberOf _
 * @alias object
 * @category Arrays
 * @param {Array} keys The array of keys.
 * @param {Array} [values=[]] The array of values.
 * @returns {Object} Returns an object composed of the given keys and
 *  corresponding values.
 * @example
 *
 * _.zipObject(['fred', 'barney'], [30, 40]);
 * // => { 'fred': 30, 'barney': 40 }
 */
function zipObject(keys, values) {
  var index = -1,
      length = keys ? keys.length : 0,
      result = {};

  if (!values && length && !isArray(keys[0])) {
    values = [];
  }
  while (++index < length) {
    var key = keys[index];
    if (values) {
      result[key] = values[index];
    } else if (key) {
      result[key[0]] = key[1];
    }
  }
  return result;
}

module.exports = zipObject;

},{"../objects/isArray":5}],4:[function(_dereq_,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="node" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/** Used to detect if a method is native */
var reNative = RegExp('^' +
  String(toString)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/toString| for [^\]]+/g, '.*?') + '$'
);

/**
 * Checks if `value` is a native function.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
 */
function isNative(value) {
  return typeof value == 'function' && reNative.test(value);
}

module.exports = isNative;

},{}],5:[function(_dereq_,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="node" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = _dereq_('../internals/isNative');

/** `Object#toString` result shortcuts */
var arrayClass = '[object Array]';

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray;

/**
 * Checks if `value` is an array.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
 * @example
 *
 * (function() { return _.isArray(arguments); })();
 * // => false
 *
 * _.isArray([1, 2, 3]);
 * // => true
 */
var isArray = nativeIsArray || function(value) {
  return value && typeof value == 'object' && typeof value.length == 'number' &&
    toString.call(value) == arrayClass || false;
};

module.exports = isArray;

},{"../internals/isNative":4}],6:[function(_dereq_,module,exports){
/**
 * Expose `pathtoRegexp`.
 */

module.exports = pathtoRegexp;

/**
 * Normalize the given path string,
 * returning a regular expression.
 *
 * An empty array should be passed,
 * which will contain the placeholder
 * key names. For example "/user/:id" will
 * then contain ["id"].
 *
 * @param  {String|RegExp|Array} path
 * @param  {Array} keys
 * @param  {Object} options
 * @return {RegExp}
 * @api private
 */

function pathtoRegexp(path, keys, options) {
  options = options || {};
  var sensitive = options.sensitive;
  var strict = options.strict;
  var end = options.end !== false;
  keys = keys || [];

  if (path instanceof RegExp) return path;
  if (path instanceof Array) path = '(' + path.join('|') + ')';

  path = path
    .concat(strict ? '' : '/?')
    .replace(/\/\(/g, '/(?:')
    .replace(/([\/\.])/g, '\\$1')
    .replace(/(\\\/)?(\\\.)?:(\w+)(\(.*?\))?(\*)?(\?)?/g, function (match, slash, format, key, capture, star, optional) {
      slash = slash || '';
      format = format || '';
      capture = capture || '([^/' + format + ']+?)';
      optional = optional || '';

      keys.push({ name: key, optional: !!optional });

      return ''
        + (optional ? '' : slash)
        + '(?:'
        + format + (optional ? slash : '') + capture
        + (star ? '((?:[\\/' + format + '].+?)?)' : '')
        + ')'
        + optional;
    })
    .replace(/\*/g, '(.*)');

  return new RegExp('^' + path + (end ? '$' : '(?=\/|$)'), sensitive ? '' : 'i');
};

},{}]},{},[2])
(2)
});
