// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-av project <http://lukasz.walukiewicz.eu/p/walkner-av>

var auth = require('../utils/middleware').auth;

app.get('/users', auth('viewUsers'), function(req, res, next)
{
  var User = app.db.model('User');

  User.find({}, req.query.fields).asc('name').run(function(err, docs)
  {
    if (err)
    {
      return next(err);
    }

    res.send(docs);
  });
});

app.post('/users', auth('manageUsers'), function(req, res, next)
{
  var User = app.db.model('User');
  var data = req.body;
  var password = User.hashPassword(data.password);

  data.passwordSalt = password.salt;
  data.password = password.hash;

  var user = new User(data);

  user.save(function(err)
  {
    checkDuplicateError(err, res, next, function()
    {
      res.send(user, 201);
    });
  });
});

app.get('/users/:id', auth('viewUsers'), function(req, res, next)
{
  var User = app.db.model('User');

  User.findById(req.params.id, function(err, doc)
  {
    if (err)
    {
      return next(err);
    }

    if (!doc)
    {
      return res.send(404);
    }

    res.send(doc);
  });
});

app.put('/users/:id', auth('manageUsers'), function(req, res, next)
{
  var User = app.db.model('User');

  User.findById(req.params.id, function(err, user)
  {
    if (err)
    {
      return next(err);
    }

    if (!user)
    {
      return res.send(404);
    }

    var data = req.body;

    delete data._id;

    if (!data.password || !data.password.length)
    {
      delete data.password;
    }
    else
    {
      var password = User.hashPassword(data.password);

      data.passwordSalt = password.salt;
      data.password = password.hash;
    }

    user.set(data).save(function(err)
    {
      checkDuplicateError(err, res, next, function()
      {
        res.send(204);
      });
    });
  });
});

app.del('/users/:id', auth('manageUsers'), function(req, res, next)
{
  var User = app.db.model('User');

  User.remove({_id: req.params.id}, function(err)
  {
    if (err)
    {
      return next(err);
    }

    res.send(204);
  });
});

function checkDuplicateError(err, res, errback, cb)
{
  if (err)
  {
    if (err.name === 'MongoError' && (err.code === 11000 || err.code === 11001))
    {
      return res.send('Podany login jest już zajęty :(', 400);
    }

    return errback(err);
  }

  return cb();
}
