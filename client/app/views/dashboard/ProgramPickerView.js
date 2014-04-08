// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-av <http://lukasz.walukiewicz.eu/p/walkner-av>

define(
[
  'jQuery',
  'Underscore',
  'Backbone',

  'app/touch',
  'app/user',
  'app/models/Program',
  'app/views/viewport',
  'app/views/programs/ProgramDetailsView',

  'text!app/templates/dashboard/programPicker.html'
],
/**
 * @param {jQuery} $
 * @param {Underscore} _
 * @param {Backbone} Backbone
 * @param {Object} touch
 * @param {Object} user
 * @param {function(new:Program)} Program
 * @param {Viewport} viewport
 * @param {function(new:ProgramDetailsView)} ProgramDetailsView
 * @param {String} programPickerTpl
 */
function(
  $,
  _,
  Backbone,
  touch,
  user,
  Program,
  viewport,
  ProgramDetailsView,
  programPickerTpl)
{
  /**
   * @class ProgramPickerView
   * @extends Backbone.View
   * @constructor
   * @param {Object} [options]
   */
  var ProgramPickerView = Backbone.View.extend({
    template: _.template(programPickerTpl),
    className: 'programPicker',
    events: {
      'click a.program': 'onClickSelectProgram',
      'click .startProgram': 'onClickStartProgram'
    }
  });

  ProgramPickerView.prototype.initialize = function()
  {
    this.onResizeAdjustBoxes = _.debounce(_.bind(this.adjustBoxes, this), 100);

    this.programDetailsView = null;
  };

  ProgramPickerView.prototype.destroy = function()
  {
    $(window).off('resize', this.onResizeAdjustBoxes);

    _.destruct(this, 'programDetailsView');

    this.remove();
  };

  ProgramPickerView.prototype.render = function()
  {
    var data = {
      allPrograms: this.model
    };

    this.el.innerHTML = this.template(data);

    $(window).on('resize', this.onResizeAdjustBoxes);

    if (touch.enabled)
    {
      this.$('.allPrograms .list').scrolllistview();
    }

    var me = this;

    _.defer(function()
    {
      me.adjustBoxes();

      if (touch.enabled)
      {
        touch.hideKeyboard();
      }
    });

    return this;
  };

  ProgramPickerView.prototype.onProgramSelect = function(programId) {};

  /**
   * @private
   */
  ProgramPickerView.prototype.adjustBoxes = function()
  {
    var winH = window.innerHeight;
    var contentEl = this.$('.content');
    var contentH = contentEl.outerHeight(true);
    var margin = parseInt(contentEl.css('margin-bottom'));
    var headerH = this.$('h4').outerHeight(true);
    var dataH = winH - contentH - headerH;
    var actionH = this.$('.action').outerHeight(true);

    this.$('.list').height(dataH - margin * 2);
    this.$('.programDetails').height(dataH - margin * 2);
    this.$('.properties').height(dataH - margin * 4 - actionH);
  };

  /**
   * @private
   * @param {Program} program
   */
  ProgramPickerView.prototype.renderProgramDetails = function(program)
  {
    _.destruct(this, 'programDetailsView');

    this.programDetailsView = new ProgramDetailsView({model: program});
    this.programDetailsView.render();

    this.$('.programDetails').append(this.programDetailsView.el);

    if (touch.enabled)
    {
      this.$('.properties').scrolllistview();
    }
  };

  /**
   * @private
   * @param {Object} e
   */
  ProgramPickerView.prototype.onClickSelectProgram = function(e)
  {
    viewport.msg.loading();

    var self = this;

    new Program({_id: $(e.target).attr('data-id')}).fetch({
      success: function(program)
      {
        viewport.msg.hide();

        self.renderProgramDetails(program);
        self.adjustBoxes();
      },
      error: function()
      {
        viewport.msg.loadingFailed();
      }
    });

    e.preventDefault();
  };

  /**
   * @private
   */
  ProgramPickerView.prototype.onClickStartProgram = function()
  {
    if (!this.programDetailsView || !this.programDetailsView.model)
    {
      return;
    }

    this.onProgramSelect(this.programDetailsView.model.id, undefined);
  };

  return ProgramPickerView;
});
