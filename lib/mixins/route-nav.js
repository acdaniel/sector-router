var sector; try { sector = require('sector'); } catch (e) { sector = window.sector; }
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