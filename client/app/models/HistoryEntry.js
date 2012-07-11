define(
[
  'Underscore',
  'Backbone',
  'moment',

  'app/time'
],
/**
 * @param {Underscore} _
 * @param {Backbone} Backbone
 * @param {Function} moment
 * @param {Object} time
 */
function(_, Backbone, moment, time)
{
  var STATE_TO_TEXT = {
    success: 'Ukończony',
    stop: 'Zatrzymany',
    error: 'Błąd'
  };

  var FINISH_STATE_TO_ZONE_STATE = {
    success: 'programFinished',
    stop: 'programStopped',
    error: 'programErrored'
  };

  /**
   * @class HistoryEntry
   * @extends Backbone.Model
   * @constructor
   * @param {Object} [attributes]
   * @param {Object} [options]
   */
  var HistoryEntry = Backbone.Model.extend({
    urlRoot: '/history'
  });

  /**
   * @return {Object}
   */
  HistoryEntry.prototype.toTemplateData = function()
  {
    var data = this.toJSON();

    data.runModeText = data.runMode === 'manual' ? 'Ręczny' : 'Automatyczny';

    if (data.startedAt)
    {
      data.startDate = moment(data.startedAt).format('LLL');
    }

    if (data.finishState)
    {
      data.finishStateText = STATE_TO_TEXT[data.finishState];
      data.zoneFinishState = FINISH_STATE_TO_ZONE_STATE[data.finishState];
    }

    if (data.finishedAt)
    {
      data.finishDate = moment(data.finishedAt).format('LLL');
    }

    if (data.startedAt && data.finishedAt)
    {
      data.totalTime = parseFloat((moment(data.finishedAt).diff(data.startedAt) / 1000).toFixed(2));
      data.duration = time.toString(data.totalTime);
    }

    data.programRestrikeInterval = time.toString(data.programRestrikeInterval);
    data.programRestrikeTime = time.toString(data.programRestrikeTime);

    return data;
  };

  return HistoryEntry;
});
