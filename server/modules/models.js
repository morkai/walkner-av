// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-av <http://lukasz.walukiewicz.eu/p/walkner-av>

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
