// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-av project <http://lukasz.walukiewicz.eu/p/walkner-av>

define(
[
  'jQuery',
  'Underscore',
  'Backbone',

  'app/socket',
  'app/user',
  'app/models/dashboard',
  'app/views/viewport',
  'app/views/PageLayout',

  'text!app/templates/dashboard/diag.html'
],
/**
 * @param {jQuery} $
 * @param {Underscore} _
 * @param {Backbone} Backbone
 * @param {Object} socket
 * @param {Object} user
 * @param {Viewport} viewport
 * @param {function(new:PageLayout)} PageLayout
 * @param {String} diagTpl
 */
function(
  $,
  _,
  Backbone,
  socket,
  user,
  dashboardModel,
  viewport,
  PageLayout,
  diagTpl)
{
  /**
   * @class DiagView
   * @constructor
   * @extends Backbone.View
   * @param {Object} [options]
   */
  var DiagView = Backbone.View.extend({
    className: 'diagView',
    template: _.template(diagTpl),
    layout: PageLayout,
    topics: {
      'tags changed': 'updateTags'
    },
    breadcrumbs: ['Diagnostyka'],
    events: {
      'click .digital.output': 'toggleDigitalOutput',
      'click .analog.output': 'changeAnalogOutput',
      'click': 'saveAnalogOutput'
    }
  });

  DiagView.prototype.initialize = function()
  {
    _.bindAll.apply(null, [this].concat(_.values(this.topics)));

    for (var topic in this.topics)
    {
      socket.on(topic, this[this.topics[topic]]);
    }

    this.timers = {};
  };

  DiagView.prototype.destroy = function()
  {
    for (var topic in this.topics)
    {
      socket.removeListener(topic, this[this.topics[topic]]);
    }

    this.remove();
  };

  DiagView.prototype.render = function()
  {
    this.el.innerHTML = this.template({
      transactions: this.model
    });

    this.updateTags(dashboardModel.tags);

    return this;
  };

  DiagView.prototype.updateTags = function(changes)
  {
    for (var tagName in changes)
    {
      var $tag = this.$('.tag[data-tag="' + tagName + '"]');

      if (!$tag[0])
      {
        continue;
      }

      var value = changes[tagName];

      if ($tag.hasClass('digital'))
      {
        $tag[value ? 'addClass' : 'removeClass']('on');
      }
      else
      {
        $tag.find('.value').text(value);
      }
    }
  };

  DiagView.prototype.toggleDigitalOutput = function(e)
  {
    var $tag = this.getTagEl(e.target);
    var tagName = $tag.attr('data-tag');
    var newState = $tag.hasClass('on') ? 0 : 1;

    socket.emit('set tag', tagName, newState);

    return false;
  };

  DiagView.prototype.changeAnalogOutput = function(e)
  {
    var $tag = this.getTagEl(e.target);

    if ($tag.find('.analogSlider')[0])
    {
      return false;
    }

    var tagName = $tag.attr('data-tag');
    var $value = $tag.find('.value');

    this.$('.analogSlider').remove();

    var $slider = $('<input>').attr({
      class: 'analogSlider',
      type: 'range',
      min: -32768,
      max: 32767,
      step: 1,
      value: dashboardModel.tags[tagName]
    });

    $slider.on('change', function()
    {
      $value.text($slider.val());
    });

    $slider.on('mouseup', function()
    {
      $value.text($slider.val());

      socket.emit('set tag', tagName, parseInt($slider.val()));
    });

    $slider.appendTo($tag);

    return false;
  };

  DiagView.prototype.saveAnalogOutput = function()
  {
    var $slider = this.$('.analogSlider');

    if (!$slider[0])
    {
      return;
    }

    var $tag = $slider.closest('tag');
    var tagName = $tag.attr('data-tag');

    socket.emit('set tag', tagName, parseInt($slider.val()));

    $slider.remove();
  };

  DiagView.prototype.getTagEl = function(el)
  {
    var $el = $(el);

    if ($el.hasClass('tag'))
    {
      return $el;
    }

    return $el.closest('.tag');
  }

  return DiagView;
});
