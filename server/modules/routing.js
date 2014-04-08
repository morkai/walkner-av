// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-av project <http://lukasz.walukiewicz.eu/p/walkner-av>

exports.boot = function(done)
{
  [
    'index',
    'history',
    'programs',
    'users',
    'auth'

  ].forEach(function(routerName)
  {
    require('../routers/' + routerName);
  });

  console.debug('Prepared the Express routing!');

  done();
};
