/**
 * sector-router v0.1.1
 * A router and utilities for the Sector library
 * https://github.com/acdaniel/sector-router
 *
 * Copyright 2014 Adam Daniel <adam@acdaniel.com>
 * Released under the MIT license
 *
 * Date: 2014-04-02T02:15:24.399Z
 */
!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self);var f=o;f=f.sector||(f.sector={}),f=f.ext||(f.ext={}),f.router=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var sector; try { sector = _dereq_('sector'); } catch (e) { sector = window.sector; }
var RouteContentMixin = _dereq_('../mixins/route-content');

module.exports = sector.Component.define({
  type: 'route-content'
}, sector.mixins.View, RouteContentMixin);
},{"../mixins/route-content":5}],2:[function(_dereq_,module,exports){
var sector; try { sector = _dereq_('sector'); } catch (e) { sector = window.sector; }
var RouteNavMixin = _dereq_('../mixins/route-nav');

module.exports = sector.Component.define({
  type: 'route-content'
}, sector.mixins.View, RouteNavMixin);
},{"../mixins/route-nav":6}],3:[function(_dereq_,module,exports){
/*
 * inspiration and some code borrowed from
 * http://krasimirtsonev.com/blog/article/A-modern-JavaScript-router-in-100-lines-history-api-pushState-hash-url
 * and from Backbone.Router https://github.com/jashkenas/backbone
 */
var sector; try { sector = _dereq_('sector'); } catch (e) { sector = window.sector; }

var optionalParam = /\((.*?)\)/g;
var namedParam    = /(\(\?)?:\w+/g;
var splatParam    = /\*\w+/g;
var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

module.exports = sector.Component.define({
  type: 'router',
  defaults: {
    mode: 'hash',
    root: '/',
    routeTopic: 'ui.routeChanged',
    backRequestTopic: 'ui.navigateBackRequested',
    forwardRequestTopic: 'ui.navigateForwardRequested',
    navigateRequestTopic: 'ui.navigateRequested',
    uiReadyTopic: 'ui.ready'
  },
  initialize: function (options) {
    if (!history.pushState) { this.mode = 'hash'; }
    if (this.root !== '/') {
      this.root = '/' + this.clearSlashes(options.root) + '/';
    }
    this.routes = {};
    if (options.routes) {
      for (var name in options.routes) {
        this.addRoute(name, options.routes[name]);
      }
    }
    this.subscribe(this.navigateRequestTopic, this.handleNavigateRequest);
    this.subscribe(this.backRequestTopic, this.handleBackRequest);
    this.subscribe(this.forwardRequestTopic, this.handleForwardRequest);
    this.listenTo(window, 'hashchange', this.handleHashChange);
    this.subscribe(this.uiReadyTopic, function () {
      var msg = this.parseFragment(this.getFragment());
      this.publish(this.routeTopic, msg);
    });
  },
  addRoute: function (name, route) {
    route = route.replace(escapeRegExp, '\\$&')
      .replace(optionalParam, '(?:$1)?')
      .replace(namedParam, function(match, optional) {
        return optional ? match : '([^/?]+)';
      })
      .replace(splatParam, '([^?]*?)');
    var regex = new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    this.trace('adding named route: ' + name, regex);
    this.routes[name] = regex;
  },
  getFragment: function () {
    var fragment = '', match;
    if (this.mode === 'history') {
      fragment = this.clearSlashes(decodeURI(location.pathname + location.search));
      fragment = fragment.replace(/\?(.*)$/, '');
      fragment = this.root !== '/' ? fragment.replace(this.root, '') : fragment;
    } else {
      match = window.location.href.match(/#(.*)$/);
      fragment = match ? match[1] : '';
    }
    return fragment;
  },
  parseFragment: function (fragment) {
    fragment = fragment || '/';
    this.trace('parsing fragment ' + fragment);
    for (var name in this.routes) {
      var route = this.routes[name];
      this.trace('eval route ' + name, route);
      var params = route.exec(fragment);
      if (params) {
        params = params.slice(1);
        return {
          name: name,
          path: fragment,
          params: sector.utils.map(params, function(param, i) {
            // Don't decode the search params.
            if (i === params.length - 1) { return param || null; }
            return param ? decodeURIComponent(param) : null;
          })
        };
      }
    }
    return {};
  },
  clearSlashes: function(path) {
    return path.toString().replace(/\/$/, '').replace(/^\//, '');
  },
  handleHashChange: function () {
    var fragment, msg;
    fragment = this.getFragment();
    msg = this.parseFragment(fragment);
    this.publish(this.routeTopic, msg);
  },
  handleNavigateRequest: function (msg) {
    var path = msg.data ? msg.data : '';
    if(this.mode === 'history') {
      history.pushState(null, null, this.root + this.clearSlashes(path));
    } else {
      window.location.href.match(/#(.*)$/);
      window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
    }
    var outMsg = this.parseFragment(path);
    this.publish(this.routeTopic, outMsg);
  },
  handleBackRequest: function () {
    var fragment, msg;
    window.history.back();
    fragment = this.getFragment();
    msg = this.parseFragment(fragment);
    this.publish(this.routeTopic, msg);
  },
  handleForwardRequest: function () {
    var fragment, msg;
    window.history.forward();
    fragment = this.getFragment();
    msg = this.parseFragment(fragment);
    this.publish(this.routeTopic, msg);
  }
});
},{}],4:[function(_dereq_,module,exports){

exports.mixins = {
  RouteContent: _dereq_('./mixins/route-content'),
  RouteNav: _dereq_('./mixins/route-nav')
};

exports.components = {
  Router: _dereq_('./components/router'),
  RouteContent: _dereq_('./components/route-content'),
  RouterNav: _dereq_('./components/route-nav')
};
},{"./components/route-content":1,"./components/route-nav":2,"./components/router":3,"./mixins/route-content":5,"./mixins/route-nav":6}],5:[function(_dereq_,module,exports){
var sector; try { sector = _dereq_('sector'); } catch (e) { sector = window.sector; }
var utils = sector.utils;

module.exports =  function () {
  this.defaults = utils.defaults({}, this.defaults, {
    route: null,
    activeClassName: 'active',
    routeChangedTopic: 'ui.routeChanged'
  });

  this.after('initialize', function () {
    this.subscribe(this.routeChangedTopic, function (msg) {
      if (this.route === msg.data.path) {
        utils.addClassName(this.el, this.activeClassName);
      } else {
        utils.removeClassName(this.el, this.activeClassName);
      }
    });
  });
};
},{}],6:[function(_dereq_,module,exports){
var sector; try { sector = _dereq_('sector'); } catch (e) { sector = window.sector; }
var utils = sector.utils;

module.exports =  function () {
  this.defaults = utils.defaults({}, this.defaults, {
    activeClassName: 'active',
    linkSelector: 'a[href]',
    routeChangedTopic: 'ui.routeChanged'
  });

  this.after('initialize', function () {
    this.subscribe(this.routeChangedTopic, function (msg) {
      var node, nodes = [].slice.call(this.select(this.linkSelector));
      for (var i = 0, l = nodes.length; i < l; i++) {
        node = nodes[i];
        if (node.getAttribute('href').toString() === '#' + msg.data.path) {
          utils.addClassName(node, this.activeClassName);
        } else {
          utils.removeClassName(node, this.activeClassName);
        }
      }
    });
  });
};
},{}]},{},[4])
(4)
});