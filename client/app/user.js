// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-av project <http://lukasz.walukiewicz.eu/p/walkner-av>

define(function()
{
  var user = window && window.USER ? window.USER : {};

  /**
   * @return {Boolean}
   */
  user.isLoggedIn = function()
  {
    return user.loggedIn === true;
  };

  /**
   * @param {String|Array.<String>} privilege
   * @return {Boolean}
   */
  user.isAllowedTo = function(privilege)
  {
    if (!user.privileges)
    {
      return false;
    }

    if (typeof privilege === 'string')
    {
      return privilege in user.privileges;
    }

    var privileges = [].concat(privilege);

    for (var i = 0, l = privileges.length; i < l; ++i)
    {
      privilege = privileges[i];

      if (typeof privilege !== 'string' || privilege in user.privileges)
      {
        continue;
      }

      return false;
    }

    return true;
  };

  return user;
});
