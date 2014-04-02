var sector; try { sector = require('sector'); } catch (e) { sector = window.sector; }
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