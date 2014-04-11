var sector; try { sector = require('sector'); } catch (e) { sector = window.sector; }

module.exports =  function () {
  this.defaults = sector.defaults({}, this.defaults, {
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
          sector.addClassName(node, this.activeClassName);
        } else {
          sector.removeClassName(node, this.activeClassName);
        }
      }
    });
  });
};