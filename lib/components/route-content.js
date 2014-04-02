var sector; try { sector = require('sector'); } catch (e) { sector = window.sector; }
var RouteContentMixin = require('../mixins/route-content');

module.exports = sector.Component.define({
  type: 'route-content'
}, sector.mixins.View, RouteContentMixin);