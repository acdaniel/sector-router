var sector; try { sector = require('sector'); } catch (e) { sector = window.sector; }
var pathToRegexp = require('path-to-regexp');
var zipObject = require('lodash-node/modern/arrays/zipObject');

module.exports = sector.Component.define({
  type: 'router',
  defaults: {
    backRequestTopic: 'ui.navigateBackRequested',
    forwardRequestTopic: 'ui.navigateForwardRequested',
    navigateRequestTopic: 'ui.navigateRequested',
    protectRouteRequestTopic: 'ui.protectRouteRequested',
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
    this.subscribe(this.backRequestTopic, this.handleBackRequest);
    this.subscribe(this.forwardRequestTopic, this.handleForwardRequest);
    this.subscribe(this.protectRouteRequestTopic, this.handleProtectRouteRequest);
    this.subscribe(this.routeChangeConfirmedTopic, this.handleRouteChangeConfirmed);
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
    var fragment = '', match;
    match = window.location.href.match(/#(.*)$/);
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
  handleHashChange: function () {
    var fragment, route;
    fragment = this.getFragment();
    if (this.protectedRouteFragment && fragment !== this.protectedRouteFragment) {
      this.publish(this.confirmRouteChangeRequestTopic, { currentRoute: this.protectedRouteFragment, attemptedRoute: fragment });
      event.preventDefault();
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
    window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
  },
  handleBackRequest: function () {
    window.history.back();
  },
  handleForwardRequest: function () {
    window.history.forward();
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
