// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-av <http://lukasz.walukiewicz.eu/p/walkner-av>

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

  'text!app/templates/dashboard/params.html'
],
/**
 * @param {jQuery} $
 * @param {Underscore} _
 * @param {Backbone} Backbone
 * @param {Object} socket
 * @param {Object} user
 * @param {Viewport} viewport
 * @param {function(new:PageLayout)} PageLayout
 * @param {String} paramsTpl
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
  paramsTpl)
{
  /**
   * @class ParamsView
   * @constructor
   * @extends Backbone.View
   * @param {Object} [options]
   */
  var ParamsView = Backbone.View.extend({
    className: 'paramsView',
    template: _.template(paramsTpl),
    layout: PageLayout,
    topics: {
      'tags changed': 'updateTags'
    },
    breadcrumbs: ['Regulacja napięcia'],
    events: {
      'mouseup .decreaseVoltageButton': 'saveNewVoltage',
      'mouseup .increaseVoltageButton': 'saveNewVoltage',
      'click .stepperContainer .action': 'toggleStepperTag'
    }
  });

  ParamsView.prototype.initialize = function()
  {
    _.bindAll.apply(null, [this].concat(_.values(this.topics)));

    for (var topic in this.topics)
    {
      socket.on(topic, this[this.topics[topic]]);
    }

    this.timers = {};
  };

  ParamsView.prototype.destroy = function()
  {
    for (var topic in this.topics)
    {
      socket.removeListener(topic, this[this.topics[topic]]);
    }

    this.remove();
  };

  ParamsView.prototype.render = function()
  {
    this.el.innerHTML = this.template({
      voltage: dashboardModel.tags.voltage
    });

    this.$('.decreaseVoltageButton')
      .on('mousedown', this.decreaseVoltage.bind(this));
    this.$('.increaseVoltageButton')
      .on('mousedown', this.increaseVoltage.bind(this));

    var $stepperContainer = this.$('.stepperContainer');

    ['dir', 'step', 'enable'].forEach(function(tag)
    {
      if (dashboardModel.tags[tag] === 1)
      {
        $stepperContainer.find('.' + tag + 'Button').click();
      }
    });

    return this;
  };

  ParamsView.prototype.updateTags = function(changes)
  {
    for (var tag in changes)
    {
      switch (tag)
      {
        case 'voltage':
          if (!this.timers.valueChange)
          {
            this.$('.voltageValue').text(changes.voltage);
          }
          break;

        case 'dir':
        case 'step':
        case 'enable':
          this.setStepperButtonState(tag, changes[tag]);
          break;
      }
    }
  };

  ParamsView.prototype.changeVoltage = function(dir)
  {
    var offset = 1;

    this.adjustVoltage(offset * dir);

    var paramsView = this;

    this.timers.voltageChange = setInterval(function()
    {
      paramsView.adjustVoltage(offset * dir);
    }, 200);
    this.timers.increaseOffset = setInterval(function()
    {
      switch (offset)
      {
        case 1:
          offset = 2;
          break;

        case 2:
          offset = 5;
          break;

        case 5:
          offset = 10;
          break;

        case 10:
          offset = 50;
          break;

        case 50:
          offset = 100;
          break;
      }
    }, 1000);
  };

  ParamsView.prototype.decreaseVoltage = function()
  {
    this.changeVoltage(-1);
  };

  ParamsView.prototype.increaseVoltage = function()
  {
    this.changeVoltage(1);

    return false;
  };

  ParamsView.prototype.getVoltage = function()
  {
    return parseInt(this.$('.voltageValue').text());
  };

  ParamsView.prototype.adjustVoltage = function(offset)
  {
    var newValue = this.getVoltage() + offset;

    if (newValue < 0)
    {
      newValue = 0;
    }
    else if (newValue > dashboardModel.MAX_VOLTAGE)
    {
      newValue = dashboardModel.MAX_VOLTAGE;
    }

    this.$('.voltageValue').text(newValue);
  };

  ParamsView.prototype.saveNewVoltage = function()
  {
    clearInterval(this.timers.voltageChange);
    clearInterval(this.timers.increaseOffset);
    delete this.timers.voltageChange;
    delete this.timers.increaseOffset;

    socket.emit('set tag', 'voltage', this.getVoltage());
  };

  ParamsView.prototype.toggleStepperTag = function(e)
  {
    var $button = $(e.target);

    var tag = $button.attr('data-tag');
    var currentState = $button.attr('data-state') === '1';
    var newState = currentState ? 0 : 1;

    this.setStepperButtonState(tag, newState);

    if (!e.isTrigger)
    {
      socket.emit('set tag', tag, newState);
    }
  };

  ParamsView.prototype.setStepperButtonState = function(tag, newState)
  {
    var $button = this.$('.' + tag + 'Button');

    if (newState === 1)
    {
      $button.removeClass('red').addClass('green');
    }
    else
    {
      $button.removeClass('green').addClass('red');
    }

    $button.attr('data-state', newState);
  };

  return ParamsView;
});
