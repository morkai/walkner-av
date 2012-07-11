define(
[
  'jQuery',
  'Underscore',
  'Backbone',

  'app/socket',
  'app/user',
  'app/time',
  'app/models/dashboard',
  'app/views/viewport',
  'app/views/PageLayout',
  'app/views/dashboard/ProgramPickerView',

  'text!app/templates/dashboard/home.html',
  'text!app/templates/dashboard/previousEntry.html'
],
/**
 * @param {jQuery} $
 * @param {Underscore} _
 * @param {Backbone} Backbone
 * @param {Object} socket
 * @param {Object} user
 * @param {Object} time
 * @param {Viewport} viewport
 * @param {function(new:PageLayout)} PageLayout
 * @param {function(new:ProgramPickerView)} ProgramPickerView
 * @param {String} homeTpl
 * @param {String} previousEntryTpl
 */
function(
  $,
  _,
  Backbone,
  socket,
  user,
  time,
  dashboardModel,
  viewport,
  PageLayout,
  ProgramPickerView,
  homeTpl,
  previousEntryTpl)
{
  /**
   * @class HomeView
   * @constructor
   * @extends Backbone.View
   * @param {Object} [options]
   */
  var HomeView = Backbone.View.extend({
    className: 'homeView',
    template: _.template(homeTpl),
    previousEntryTemplate: _.template(previousEntryTpl),
    layout: PageLayout,
    topics: {
      'program changed': 'updateProgram',
      'tags changed': 'updateTags',
      'new history entry': 'renderPreviousEntry'
    },
    breadcrumbs: ['Aktualny stan'],
    actions: function()
    {
      return [
        {
          text: 'Zmień program',
          className: 'blue action assignProgram',
          privileges: 'assignDefaultProgram',
          handler: this.showProgramPickerDialog.bind(this)
        },
        {
          href: '#params',
          text: 'Reguluj parametry',
          className: 'blue action',
          privileges: 'params__'
        }
      ];
    }
  });

  HomeView.prototype.initialize = function()
  {
    _.bindAll.apply(null, [this].concat(_.values(this.topics)));

    for (var topic in this.topics)
    {
      socket.on(topic, this[this.topics[topic]]);
    }

    this.timers = {};
  };

  HomeView.prototype.destroy = function()
  {
    this.stopElapsedTimeUpdater();

    for (var topic in this.topics)
    {
      socket.removeListener(topic, this[this.topics[topic]]);
    }

    for (var timer in this.timers)
    {
      clearTimeout(this.timers[timer]);
      this.timers[timer] = null;
    }

    this.remove();
  };

  HomeView.prototype.render = function()
  {
    var program = _.extend({}, dashboardModel.program, {
      time: time.toString(dashboardModel.program.time)
    });

    this.el.innerHTML = this.template({
      state: dashboardModel.stateText,
      program: program,
      temperature: dashboardModel.tags.temperature,
      voltage: dashboardModel.tags.voltage,
      current: dashboardModel.tags.current
    });

    if (dashboardModel.tags.programRunning)
    {
      this.startElapsedTimeUpdater();
    }
    else
    {
      this.stopElapsedTimeUpdater();
    }

    if (dashboardModel.previousEntry)
    {
      this.renderPreviousEntry();
    }

    this.updateLightLevel();
    this.updateRestrikeIndicators();

    return this;
  };

  HomeView.prototype.renderPreviousEntry = function()
  {
    var $previousEntry = this.$('.previousEntry.stateContainer');
    var $newPreviousEntry = $(this.previousEntryTemplate(dashboardModel.previousEntry));

    if ($previousEntry.length)
    {
      $previousEntry.replaceWith($newPreviousEntry);
    }
    else
    {
      this.$('.stateContainers').append($newPreviousEntry);
    }
  };

  HomeView.prototype.updateProgram = function(newProgram)
  {
    this.render();
  };

  HomeView.prototype.updateTags = function(changes)
  {
    for (var tag in changes)
    {
      var value = changes[tag];

      switch (tag)
      {
        case 'voltage':
        case 'current':
        case 'temperature':
          this.$('.' + tag).text(value);
          break;

        case 'light':
          this.updateLightLevel();
          break;

        case 'programRunning':
          this.$('.state').text(dashboardModel.stateText);

          if (changes.programRunning)
          {
            this.startElapsedTimeUpdater();
          }
          else
          {
            this.stopElapsedTimeUpdater();
            this.updateRestrikeIndicators();
          }
          break;

        case 'hrsIteration':
          this.updateRestrikeIndicators();
          break;

        case 'connected':
          this.updateStateIndicator();
          break;
      }
    }
  };

  HomeView.prototype.startElapsedTimeUpdater = function()
  {
    $('input.assignProgram').attr('disabled', true);

    var $elapsedTime = this.$('.elapsedTime');
    var $progressValue = this.$('.progressValue');

    $elapsedTime.show();
    $progressValue.show();

    this.$('.currentEntry.stateContainer')
      .removeClass('connected').addClass('programRunning');

    var updatedIndicators = false;
    var program = dashboardModel.program;
    var me = this;

    function adjustProgressBar()
    {
      $elapsedTime.text(time.toString(program.elapsedTime));

      if (!updatedIndicators && program.elapsedTime >= program.time)
      {
        updatedIndicators = true;

        me.updateRestrikeIndicators();
      }

      var percentComplete = 100 * program.elapsedTime / program.time;

      if (percentComplete > 100)
      {
        percentComplete = 100;
      }

      $progressValue.css('width', percentComplete + '%');
    }

    this.timers.elapsedTime = setInterval(adjustProgressBar, 1000);

    adjustProgressBar();
  };

  HomeView.prototype.stopElapsedTimeUpdater = function()
  {
    $('input.assignProgram').attr('disabled', false);

    this.$('.elapsedTime').hide().text('0');
    this.$('.progressValue').hide().css('width', '0');

    this.updateStateIndicator();

    clearInterval(this.timers.elapsedTime);
    this.timers.elapsedTime = null;
  };

  HomeView.prototype.updateRestrikeIndicators = function()
  {
    clearTimeout(this.timers.hrsIndicatorOn);
    clearInterval(this.timers.hrsCountdown);

    var iteration = dashboardModel.tags.hrsIteration;
    var program = dashboardModel.program;

    var $indicators = this.$('.restrikeIndicator')
      .removeClass()
      .addClass('restrikeIndicator');

    if (!dashboardModel.tags.programRunning
      || program.elapsedTime < program.time)
    {
      $indicators.addClass('disconnected');
      $indicators.find('.stateIndicator').text(program.restrikeInterval);

      return;
    }

    var $indicator;
    var $stateIndicator;

    for (var i = 1, l = $indicators.length; i <= l; ++i)
    {
      $indicator = $($indicators[i - 1]);

      if (i <= iteration)
      {
        $indicator.addClass('programFinished');
        $indicator.find('.stateIndicator').text('');
      }
      else
      {
        $indicator.addClass('disconnected');
        $indicator.find('.stateIndicator').text(program.restrikeInterval);
      }
    }

    if (iteration === program.restrikeCount)
    {
      return;
    }

    var hrsCurrentTime = program.elapsedTime - program.time;
    var hrsInterval = program.restrikeInterval;
    var hrsTime = program.restrikeTime;
    var hrsIterationTime = hrsInterval + hrsTime;

    hrsCurrentTime -= hrsIterationTime * iteration;

    if (hrsCurrentTime < 0)
    {
      hrsCurrentTime = 0;
    }

    $indicator = $($indicators[iteration])
      .removeClass('disconnected').addClass('programStopped');
    $stateIndicator = $indicator.find('.stateIndicator');

    var me = this;

    function startCountdown()
    {
      me.timers.hrsCountdown = setInterval(
        function()
        {
          $stateIndicator.text(parseInt($stateIndicator.text()) - 1);
        },
        1000
      );
    }

    var skipIntervalPhase = false;

    function setOn()
    {
      clearInterval(me.timers.hrsCountdown);

      $indicator.removeClass('programStopped').addClass('programRunning');

      if (!skipIntervalPhase)
      {
        $stateIndicator.text(hrsTime);
      }

      startCountdown();
    }

    if (hrsCurrentTime >= hrsInterval)
    {
      hrsCurrentTime -= hrsInterval;
      skipIntervalPhase = true;
    }

    $stateIndicator.text(parseInt($stateIndicator.text()) - hrsCurrentTime);

    if (skipIntervalPhase)
    {
      setOn();
    }
    else
    {
      startCountdown();

      this.timers.hrsIndicatorOn = setTimeout(
        setOn,
        hrsInterval * 1000 - hrsCurrentTime * 1000
      );
    }
  };

  HomeView.prototype.updateLightLevel = function()
  {
    var $light = this.$('.lightLevel');

    if (dashboardModel.tags.light < 1)
    {
      $light.removeClass('on');
    }
    else
    {
      $light.addClass('on');
      $light.find('.light').text(dashboardModel.tags.light + '%');
      $light.find('img').css('opacity', (dashboardModel.tags.light / 100) + .1);
    }
  };

  HomeView.prototype.updateStateIndicator = function()
  {
    var $currentEntry = this.$('.currentEntry.stateContainer')
      .removeClass('programRunning connected disconnected');

    if (dashboardModel.tags.connected)
    {
      $currentEntry.addClass(
        dashboardModel.tags.programRunning ? 'programRunning' : 'connected'
      );
    }
    else
    {
      $currentEntry.addClass('disconnected');
    }
  };

  HomeView.prototype.showProgramPickerDialog = function(e)
  {
    if (e)
    {
      e.preventDefault();
    }

    viewport.msg.loading();

    $.ajax({
      url: '/programs',
      data: {
        fields: ['name'],
        conditions: {predefined: 0}
      },
      success: this.showProgramPicker.bind(this),
      error: function()
      {
        viewport.msg.loadingFailed();
      }
    });
  };

  HomeView.prototype.showProgramPicker = function(programs)
  {
    var programPickerView = new ProgramPickerView({model: programs});
    var me = this;

    programPickerView.onProgramSelect = function(programId)
    {
      viewport.closeDialog();
      me.changeProgram(programId);
    };

    viewport.showDialog(programPickerView);
  };

  HomeView.prototype.changeProgram = function(programId)
  {
    if (dashboardModel.tags.programRunning)
    {
      return viewport.msg.show({
        type: 'error',
        text: 'Nie można zmienić programu w trakcie trwania testu :(',
        time: 5000
      });
    }

    $.ajax({
      type: 'PUT',
      url: '/programs/' + programId + ';assign',
      success: function()
      {
        viewport.msg.show({
          type: 'success',
          time: 2500,
          text: 'Program został przypisany pomyślnie!'
        });
      },
      error: function()
      {
        viewport.msg.show({
          type: 'error',
          time: 5000,
          text: 'Nie udało się przypisać programu :('
        });
      }
    });
  };

  return HomeView;
});
