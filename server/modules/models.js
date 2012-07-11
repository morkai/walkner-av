exports.boot = function(done)
{
  [
    'HistoryEntry',
    'User',
    'Program',
    'Stats'

  ].forEach(function(modelName)
  {
    require('../models/' + modelName);
  });

  console.debug('Prepared the Mongoose models!');

  done();
};
