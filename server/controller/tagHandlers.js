// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-av project <http://lukasz.walukiewicz.eu/p/walkner-av>

var scalers = require('../../config/controller').scalers;

/**
 * @param {Array.<Number>} byteArray
 * @param {Number} startIndex
 * @param {Number} bitCount
 * @return {Array.<Boolean>}
 */
function toBits(byteArray, startIndex, bitCount)
{
  var bitArray = [];
  var byteCount = byteArray.length;

  for (var byteIndex = startIndex; byteIndex < byteCount; ++byteIndex)
  {
    var byteValue = byteArray[byteIndex];

    for (var bitIndex = 0; bitIndex < 8; ++bitIndex)
    {
      if (bitArray.length === bitCount)
      {
        break;
      }

      bitArray.push(Boolean(byteValue & Math.pow(2, bitIndex)) ? 1 : 0);
    }
  }

  return bitArray;
}

/**
 * @param {Array.<String>} tags
 * @param {Object} allTags
 * @param {Function} onChange
 * @param {Array.<Number>} tagValues
 */
function checkTagChanges(tags, allTags, onChange, tagValues)
{
  var changes = {};
  var changed = false;

  for (var i = 0, l = tagValues.length; i < l; ++i)
  {
    var tag = tags[i];

    if (tag === '_')
    {
      continue;
    }

    var newValue = tagValues[i];
    var oldValue = allTags[tag];

    if (tag in scalers && typeof scalers[tag].scaler === 'function')
    {
      newValue = scalers[tag].scaler(newValue);
    }

    if (oldValue !== newValue)
    {
      allTags[tag] = newValue;
      changes[tag] = newValue;
      changed = true;
    }
  }

  if (changed)
  {
    onChange(changes);
  }
}

function handleBitValues(tags, allTags, onChange)
{
  var checkChanges = checkTagChanges.bind(null, tags, allTags, onChange);

  return function(err, data)
  {
    if (err)
    {
      return console.error('[modbus] %s', err.message);
    }

    checkChanges(toBits(data, 1, tags.length));
  };
}

function handleByteValues(tags, allTags, onChange)
{
  var checkChanges = checkTagChanges.bind(null, tags, allTags, onChange);

  return function(err, data)
  {
    if (err)
    {
      return console.error('[modbus] %s', err.message);
    }

    var tagValues = [];

    for (var i = 1, l = data.length - 1; i < l; i += 2)
    {
      tagValues.push(data.readInt16BE(i));
    }

    checkChanges(tagValues);
  };
}

exports[0x01] = handleBitValues;
exports[0x02] = handleBitValues;
exports[0x03] = handleByteValues;
exports[0x04] = handleByteValues;
