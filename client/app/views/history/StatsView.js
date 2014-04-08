// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-av <http://lukasz.walukiewicz.eu/p/walkner-av>

define(
[
  'jQuery',
  'Underscore',
  'Backbone',
  'moment',

  'app/user',
  'app/socket',
  'app/views/viewport',
  'app/views/PageLayout',

  'text!app/templates/history/stats.html'
],
/**
 * @param {jQuery} $
 * @param {Underscore} _
 * @param {Backbone} Backbone
 * @param {moment} moment
 * @param {Object} user
 * @param {Socket} socket
 * @param {Viewport} viewport
 * @param {function(new:PageLayout)} PageLayout
 * @param {String} statsTpl
 */
  function(
  $,
  _,
  Backbone,
  moment,
  user,
  socket,
  viewport,
  PageLayout,
  statsTpl)
{
  /**
   * @class StatsView
   * @constructor
   * @extends Backbone.View
   * @param {Object} [options]
   */
  var StatsView = Backbone.View.extend({
    className: 'stats',
    helpHash: 'stats-view',
    template: _.template(statsTpl),
    layout: PageLayout,
    breadcrumbs: ['Statystyki'],
    actions: function()
    {
      return [
        {
          text: 'Nowa zmiana',
          className: 'red action newShift',
          privileges: 'statsNewShift',
          handler: this.newShift.bind(this)
        }
      ];
    },
    events: {
      'click .action': 'handleAction'
    },
    topics: {
      'adjust stats': 'adjustStats'
    }
  });

  StatsView.prototype.initialize = function()
  {
    _.bindAll.apply(null, [this].concat(_.values(this.topics)));

    for (var topic in this.topics)
    {
      socket.on(topic, this[this.topics[topic]]);
    }
  };

  StatsView.prototype.destroy = function()
  {
    for (var topic in this.topics)
    {
      socket.removeListener(topic, this[this.topics[topic]]);
    }

    this.remove();
  };

  StatsView.prototype.render = function()
  {
    this.el.innerHTML = this.template(this.model);

    if (!user.isAllowedTo('statsCorrection'))
    {
      this.$('.action').attr('disabled', true);
    }

    this.updateStartedAt(this.model.startedAt);

    return this;
  };

  StatsView.prototype.newShift = function()
  {
    socket.emit('new shift');
  };

  StatsView.prototype.handleAction = function(e)
  {
    var $button = $(e.target);
    var type = $button.attr('data-type');
    var action = $button.attr('data-action');

    socket.emit('adjust stats', type, action);
  };

  StatsView.prototype.adjustStats = function(changes)
  {
    if ('passed' in changes)
    {
      this.$('.passedCount').text(changes.passed);
    }

    if ('failed' in changes)
    {
      this.$('.failedCount').text(changes.failed);
    }

    if ('startedAt' in changes)
    {
      this.updateStartedAt(changes.startedAt);
    }
  };

  StatsView.prototype.updateStartedAt = function(startedAt)
  {
    $('.breadcrumbs li:last-child').text('Statystyki od ' + moment(startedAt).format('L LT'));
  };

  return StatsView;
});
