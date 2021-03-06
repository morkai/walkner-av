// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-av project <http://lukasz.walukiewicz.eu/p/walkner-av>

define(
[
  'jQuery',
  'Underscore',
  'Backbone',

  'app/user',
  'app/models/Program',
  'app/views/viewport',
  'app/views/PageLayout',

  'text!app/templates/programs/form.html'
],
/**
 * @param {jQuery} $
 * @param {Underscore} _
 * @param {Backbone} Backbone
 * @param {Object} user
 * @param {function(new:Program)} Program
 * @param {Viewport} viewport
 * @param {function(new:PageLayout)} PageLayout
 * @param {String} formTpl
 */
function(
  $,
  _,
  Backbone,
  user,
  Program,
  viewport,
  PageLayout,
  formTpl)
{
  /**
   * @class AddProgramFormView
   * @constructor
   * @extends Backbone.View
   * @param {Object} [options]
   */
  var AddProgramFormView = Backbone.View.extend({
    helpHash: 'programs-add',
    template: _.template(formTpl),
    layout: PageLayout,
    breadcrumbs: function()
    {
      return [
        {href: '#programs', text: 'Programy'},
        'Nowy program'
      ];
    },
    actions: function()
    {
      return [{
        text: 'Zapisz',
        className: 'blue save action',
        handler: this.submitForm
      }];
    },
    events: {
      'submit .form': 'submitForm'
    }
  });

  AddProgramFormView.prototype.initialize = function()
  {
    _.bindAll(this, 'submitForm');
  };

  AddProgramFormView.prototype.destroy = function()
  {
    this.remove();
  };

  AddProgramFormView.prototype.render = function()
  {
    var program = this.model.toTemplateData();

    this.el.innerHTML = this.template({
      action: '/programs',
      program: program,
      showPredefFields: false
    });

    return this;
  };

  /**
   * @private
   */
  AddProgramFormView.prototype.submitForm = function()
  {
    var data = this.$('form.program').toObject({skipEmpty: false}).program;

    if (data.name === null)
    {
      data.name = '';
    }

    if (data.name.trim() === '')
    {
      viewport.msg.show({
        type: 'error',
        time: 2500,
        text: 'Nazwa programu jest wymagana.'
      });

      return false;
    }

    if (isNaN(parseInt(data.time)))
    {
      viewport.msg.show({
        type: 'error',
        time: 2500,
        text: 'Czas trwania jest wymagany.'
      });

      return false;
    }

    var program = new Program();

    program.save(data, {
      success: function()
      {
        viewport.msg.show({
          type: 'success',
          time: 5000,
          text: 'Nowy program został dodany!'
        });

        Backbone.history.navigate('programs/' + program.id, true);
      },
      error: function(_, xhr)
      {
        viewport.msg.show({
          type: 'error',
          time: 5000,
          text: xhr.responseText || 'Nie udało się zapisać nowego programu :('
        });
      }
    });

    return false;
  };

  return AddProgramFormView;
});
