// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-av <http://lukasz.walukiewicz.eu/p/walkner-av>

define(
[
  'jQuery',
  'Backbone',

  'app/views/viewport',
  'app/views/LoginView',
  'app/views/LogoutView',
  'app/views/dashboard/HomeView',
  'app/views/dashboard/ParamsView',
  'app/views/dashboard/DiagView'
],
/**
 * @param {jQuery} jQuery
 * @param {Backbone} Backbone
 * @param {Viewport} viewport
 * @param {function(new:LoginView)} LoginView
 * @param {function(new:LogoutView)} LogoutView
 * @param {function(new:HomeView)} HomeView
 * @param {function(new:ParamsView)} ParamsView
 * @param {function(new:ParamsView)} DiagView
 */
function(
  $,
  Backbone,
  viewport,
  LoginView,
  LogoutView,
  HomeView,
  ParamsView,
  DiagView)
{
  /**
   * @class HomeRouter
   * @constructor
   * @extends Backbone.Router
   * @param {Object} [options]
   */
  var HomeRouter = Backbone.Router.extend({
    routes: {
      '': 'dashboard',
      'params': 'params',
      'diag': 'diag',
      'login': 'login',
      'logout': 'logout'
    }
  });

  HomeRouter.prototype.dashboard = function()
  {
    viewport.showView(new HomeView());
  };

  HomeRouter.prototype.params = function()
  {
    if (viewport.msg.auth('params'))
    {
      return;
    }

    viewport.showView(new ParamsView());
  };

  HomeRouter.prototype.diag = function()
  {
    $.ajax({
      url: '/transactions',
      success: function(transactions)
      {
        viewport.showView(new DiagView({model: transactions}));
      }
    });
  };

  HomeRouter.prototype.login = function()
  {
    viewport.showView(new LoginView());
  };

  HomeRouter.prototype.logout = function()
  {
    viewport.showView(new LogoutView());
  };

  return HomeRouter;
});
