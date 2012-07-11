var guestUser = require('../../config/auth').guestUser;
var controller = require('../controller');

var indexFile = app.settings.env === 'production'
  ? 'index-min.ejs'
  : 'index.ejs';

app.get('/', function(req, res, next)
{
  var currentProgram = controller.currentProgram
    ? controller.currentProgram.toJSON()
    : {};

  if (controller.currentEntry)
  {
    var elapsedTimeMs =
      Date.now() - controller.currentEntry.get('startedAt').getTime();

    currentProgram.elapsedTime = Math.round(elapsedTimeMs / 1000);
  }

  res.render(indexFile, {
    layout: false,
    user: JSON.stringify(req.session.user || guestUser),
    previousEntry: JSON.stringify(controller.previousEntry),
    program: JSON.stringify(currentProgram),
    tags: JSON.stringify(controller.tags)
  });
});

app.get('/transactions', function(req, res)
{
  var transactions = [];

  require('../../config/controller').transactions.forEach(function(t)
  {
    var digital = t.fn === 0x01 || t.fn === 0x02;
    var className = (digital ? 'digital' : 'analog')
      + (t.writable ? ' output' : ' input');

    transactions.push({
      id: t.id,
      unit: t.unit,
      digital: digital,
      writable: t.writable,
      tags: t.tags,
      className: className
    });
  });

  res.send(transactions);
});

app.get('/ping', function(req, res)
{
  res.send('pong');
});

app.get('/time', function(req, res)
{
  res.send(Date.now().toString());
});

