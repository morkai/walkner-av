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
