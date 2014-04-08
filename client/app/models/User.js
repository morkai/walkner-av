// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-av <http://lukasz.walukiewicz.eu/p/walkner-av>

define(
[
  'Underscore',
  'Backbone'
],
/**
 * @param {Underscore} _
 * @param {Backbone} Backbone
 */
function(_, Backbone)
{
  /**
   * @class User
   * @extends Backbone.Model
   * @constructor
   * @param {Object} [attributes]
   * @param {Object} [options]
   */
  var User = Backbone.Model.extend({
    urlRoot: '/users',
    defaults: {
      name: '',
      email: '',
      login: '',
      password: '',
      password2: '',
      privileges: {}
    }
  });

  /**
   * @return {Object}
   */
  User.prototype.toTemplateData = function()
  {
    var data = this.toJSON();

    return data;
  };

  return User;
});
