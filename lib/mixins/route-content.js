var sector; try { sector = require('sector'); } catch (e) { sector = window.sector; }

module.exports =  function () {
  this.defaults = sector.defaults({}, this.defaults, {
    route: null,
    activeClassName: 'active',
    routeChangedTopic: 'ui.routeChanged'
  });

  this.after('initialize', function () {
    this.subscribe(this.routeChangedTopic, function (msg) {
      if (this.route === msg.data.path) {
        sector.addClassName(this.el, this.activeClassName);
      } else {
        sector.removeClassName(this.el, this.activeClassName);
      }
    });
  });
};