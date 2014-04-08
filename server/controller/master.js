// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-av project <http://lukasz.walukiewicz.eu/p/walkner-av>

var modbus = require('h5.modbus');
var config = require('../../config/controller');
var tagHandlers = require('./tagHandlers');

var master = module.exports = modbus.createMaster(config.master);
var tagCache = {};
var connectedAt;

master.on('connect', function()
{
  connectedAt = Date.now();

  console.debug('[modbus] Connected!');
});

master.on('disconnect', function()
{
  if (connectedAt)
  {
    console.debug(
      '[modbus] Disconnected after %ds :(',
      Math.round((Date.now() - connectedAt) / 1000 * 10) / 10
    );

    connectedAt = 0;
  }
});

master.on('error', function(err)
{
  if (err.code !== 'ECONNREFUSED')
  {
    console.error('[modbus] %s', err.stack);
  }
});

master.setUpTransactions = function(allTags, handleTagChanges)
{
  config.transactions.forEach(function(t)
  {
    t.tags.forEach(function(tag, idx)
    {
      allTags[tag] = -1;

      if (t.writable)
      {
        tagCache[tag] = {
          tag: tag,
          unit: t.unit,
          fn: t.fn === 0x01 ? 0x05 : 0x10,
          address: t.address + idx
        };
      }
    });

    master.addTransaction({
      id: t.id,
      unit: t.unit,
      fn: t.fn,
      address: t.address,
      quantity: t.tags.length,
      handler: tagHandlers[t.fn](t.tags, allTags, handleTagChanges),
      interval: t.interval
    });
  });
};

master.setTagValue = function(tag, value, done)
{
  var tagInfo = tagCache[tag];

  if (!tagInfo)
  {
    return done && done("Unknown tag: " + tag);
  }

  console.debug('Setting tag [%s] to [%s]...', tag, value);

  var req = {
    unit: tagInfo.unit,
    fn: tagInfo.fn,
    address: tagInfo.address,
    retries: 3,
    handler: function(err)
    {
      if (err)
      {
        console.error('...failed to set tag [%s] to [%s].', tag, value);
      }
      else
      {
        console.debug('...tag [%s] was set to [%s].', tag, value);
      }

      done && done(err);
    }
  };

  if (tagInfo.fn === 0x05 || Buffer.isBuffer(value))
  {
    req.value = value;
  }
  else
  {
    if (!Array.isArray(value))
    {
      value = [value];
    }

    var buffer = new Buffer(value.length * 2);

    value.forEach(function(val, i)
    {
      buffer.writeInt16BE(val, i * 2);
    });

    req.values = buffer;
  }

  master.executeRequest(req);
};

master.setTagValues = function(tags, done)
{
  var tdone = typeof done;
  if (tdone !== 'function' && tdone !== 'undefined')
  {
    var e = new Error();
    console.log('-------------------------------');
    console.log(tdone);
    console.log(done);
    console.log(tags);
    console.log(e.stack);
    console.log('-------------------------------');
  }

  console.debug('Setting tags:', tags);

  var tagInfo = [];

  for (var tag in tags)
  {
    if (tag in tagCache)
    {
      tagInfo.push(tagCache[tag]);
    }
  }

  tagInfo.sort(function(a, b)
  {
    return a.address > b.address;
  });

  var tagCount = tagInfo.length;

  if (tagCount === 0)
  {
    return done && done("At least one tag is required.");
  }

  var values = new Buffer(tagCount * 2);
  values.writeInt16BE(tags[tagInfo[0].tag], 0);

  for (var i = 1; i < tagCount; ++i)
  {
    if ((tagInfo[i].address - tagInfo[i - 1].address) !== 1)
    {
      return done && done("The specified tags must be consecutive.")
    }

    values.writeInt16BE(tags[tagInfo[i].tag], i * 2);
  }

  var req = {
    unit: tagInfo[0].unit,
    fn: 0x10,
    address: tagInfo[0].address,
    values: values,
    retries: 3,
    handler: function(err)
    {
      if (err)
      {
        console.error('..failed to set tags:', tags);
      }
      else
      {
        console.debug('...set tags:', tags);
      }

      done && done(err);
    }
  };

  master.executeRequest(req);
};
