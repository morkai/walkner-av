define(
[
  'Underscore',
  'Backbone',

  'app/time'
],
/**
 * @param {Underscore} _
 * @param {Backbone} Backbone
 */
function(_, Backbone, time)
{
  /**
   * @class Program
   * @extends Backbone.Model
   * @constructor
   * @param {Object} [attributes]
   * @param {Object} [options]
   */
  var Program = Backbone.Model.extend({
    urlRoot: '/programs',
    defaults: {
      name: '',
      time: 0,
      restrikeInterval: 0,
      restrikeTime: 0,
      restrikeCount: 0,
      predefined: 0
    }
  });

  /**
   * @param {Number} startTimeOrTime
   * @param {Number} stopTime
   * @return {String}
   */
  Program.calcDuration = function(startTimeOrTime, stopTime)
  {
    return time.toString(
      arguments.length === 1
        ? startTimeOrTime
        : ((stopTime - startTimeOrTime) / 1000)
    );
  };

  /**
   * @param {Object} attrs
   * @return {?Array}
   */
  Program.prototype.validate = function(attrs)
  {
    var errors = [];

    for (var name in attrs)
    {
      var value = attrs[name];

      switch (name)
      {
        case 'name':
          if (value.trim() === '')
          {
            errors.push('Nazwa programu jest wymagana.');
          }
          break;

        case 'predefined':
          attrs[name] = parseInt(value) || 0;
          break;

        case 'restrikeCount':
          attrs[name] = parseInt(value) || 0;

          if (attrs[name] < 0)
          {
            attrs[name] = 0;
          }
          else if (attrs[name] > 5)
          {
            attrs[name] = 5;
          }
          break;

        case 'time':
        case 'restrikeInterval':
        case 'restrikeTime':
          attrs[name] = time.toSeconds(value);
          break;
      }
    }

    return errors.length ? errors : null;
  };

  /**
   * @param {Object} [options]
   * @return {Object}
   */
  Program.prototype.toTemplateData = function(options)
  {
    var data = this.toJSON();

    data.time = time.toString(data.time);
    data.restrikeInterval = time.toString(data.restrikeInterval);
    data.restrikeTime = time.toString(data.restrikeTime);

    return data;
  };

  return Program;
});
