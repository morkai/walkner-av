// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-av project <http://lukasz.walukiewicz.eu/p/walkner-av>

define(
[
  'jQuery',
  'Underscore',
  'Backbone',

  'app/models/Program',
  'app/views/viewport',
  'app/views/PageLayout',

  'text!app/templates/history/entry.html',

  'vendor/flot/jquery.flot-min.js'
],
/**
 * @param {jQuery} $
 * @param {Underscore} _
 * @param {Backbone} Backbone
 * @param {function(new:Program)} Program
 * @param {Viewport} viewport
 * @param {function(new:PageLayout)} PageLayout
 * @param {String} entryTpl
 */
function(
  $,
  _,
  Backbone,
  Program,
  viewport,
  PageLayout,
  entryTpl)
{
  var COLLECTED_DATA_SUFFIXES = {
    'temperature': '\u00B0C',
    'light': '',
    'current': 'A',
    'voltage': 'V'
  };

  /**
   * @class HistoryEntryView
   * @constructor
   * @extends Backbone.View
   * @param {Object} [options]
   */
  var HistoryEntryView = Backbone.View.extend({
    className: 'historyEntry',
    helpHash: 'history-view',
    template: _.template(entryTpl),
    layout: PageLayout,
    breadcrumbs: function()
    {
      return [
        {href: '#history', text: 'Historia'},
        'Wpis'
      ];
    },
    events: {
      'click .collectedDataTypes li': 'changeGraphData'
    }
  });

  HistoryEntryView.prototype.initialize = function()
  {
    this.plot = null;
  };

  HistoryEntryView.prototype.destroy = function()
  {
    if (this.plot)
    {
      this.plot.shutdown();
    }

    this.remove();
  };

  HistoryEntryView.prototype.render = function()
  {
    var entry = this.model.toTemplateData();

    this.el.innerHTML = this.template({entry: entry});

    this.renderGraph('temperature');

    return this;
  };

  HistoryEntryView.prototype.changeGraphData = function(e)
  {
    var $el = $(e.target);

    if ($el.hasClass('current'))
    {
      return false;
    }

    $el.siblings('.current').removeClass('current');
    $el.addClass('current');

    this.renderGraph($(e.target).attr('data-property'));

    return false;
  };

  HistoryEntryView.prototype.renderGraph = function(property)
  {
    if (this.plot)
    {
      this.plot.shutdown();
      this.plot = null;
    }

    var $el = this.$('.collectedDataGraph');
    var rawData = this.model.get(property);
    var seriesData = [];

    if (!rawData || !rawData.length)
    {
      $el.height('auto').text('Brak danych.');

      return;
    }

    rawData.forEach(function(value, i)
    {
      seriesData.push([i, value]);
    });

    $el.width('100%').height('250px').css('background-color', '#FFF');

    this.plot = $.plot($el, [seriesData], {
      xaxis: {
        tickFormatter: function(value)
        {
          return parseFloat(value.toFixed(1)) + 's';
        }
      },
      yaxis: {
        tickFormatter: function(value)
        {
          return value.toFixed(0) + COLLECTED_DATA_SUFFIXES[property];
        }
      }
    });
  };

  return HistoryEntryView;
});
