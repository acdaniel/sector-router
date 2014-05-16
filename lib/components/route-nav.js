var sector; try { sector = require('sector'); } catch (e) { sector = window.sector; }
var RouteNavMixin = require('../mixins/route-nav');

module.exports = sector.Component.define({
  type: 'route-nav'
}, sector.mixins.View, RouteNavMixin);
