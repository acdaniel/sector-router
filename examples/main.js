/* global sector */

sector.Component.define({
  type: 'navigator',
  ui: {
    back: '.back-button',
    foward: '.forward-button',
    randomRoute: '.random-route-button'
  },
  events: {
    'click @back': 'handleBackClick',
    'click @foward': 'handleForwardClick',
    'click @randomRoute': 'handleRandomRouteClick',
    'click @paramRoute': 'handleParamRouteClick'
  },
  initialize: function () {
    this.subscribe('ui.alertRequested', function (msg) {
      alert(JSON.stringify(msg.data));
    });
    this.subscribe('ui.routeChanged', function (msg) {
      console.log(msg);
    });
  },
  handleBackClick: function () {
    this.publish('ui.navigateBackRequested');
  },
  handleForwardClick: function () {
    this.publish('ui.navigateForwardRequested');
  },
  handleRandomRouteClick: function () {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for( var i=0; i < 5; i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    this.publish('ui.navigateRequested', '/' + text);
  }
}, sector.mixins.View);

sector.ext.router.components.Router.attachTo(document, {
  debug: true,
  mode: 'hash',
  routes: {
    '/alert/:msg': 'ui.alertRequested'
  }
});

sector.init();
