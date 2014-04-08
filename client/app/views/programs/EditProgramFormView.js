// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-av <http://lukasz.walukiewicz.eu/p/walkner-av>

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
   * @class EditProgramFormView
   * @constructor
   * @extends Backbone.View
   * @param {Object} [options]
   */
  var EditProgramFormView = Backbone.View.extend({
    helpHash: 'programs-edit',
    template: _.template(formTpl),
    layout: PageLayout,
    breadcrumbs: function()
    {
      var model = this.model;

      return [
        {href: '#programs', text: 'Programy'},
        {href: '#programs/' + model.id, text: model.get('name')},
        {text: 'Edycja'}
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
      'submit .form': 'submitForm',
      'change input[name="program.predefined"]': 'toggleHrsFields'
    }
  });

  EditProgramFormView.prototype.initialize = function()
  {
    _.bindAll(this, 'submitForm');
  };

  EditProgramFormView.prototype.destroy = function()
  {
    this.remove();
  };

  EditProgramFormView.prototype.render = function()
  {
    var program = this.model.toTemplateData();
    var showPredefFields = user.isAllowedTo('predefinePrograms');

    this.el.innerHTML = this.template({
      action: '/programs/' + program._id,
      program: program,
      showPredefFields: showPredefFields
    });

    if (showPredefFields)
    {
      this.$('#program-predefined' + program.predefined).attr('checked', true);
      this.toggleHrsFields();
    }

    return this;
  };

  EditProgramFormView.prototype.toggleHrsFields = function()
  {
    var $checkedPredefField =
      this.$('input[name="program.predefined"]:checked');

    this.$('.hrsField').attr('disabled', $checkedPredefField.val() !== '0');
  };

  /**
   * @private
   */
  EditProgramFormView.prototype.submitForm = function()
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

    var program = this.model;

    program.save(data, {
      success: function()
      {
        viewport.msg.show({
          type: 'success',
          time: 5000,
          text: 'Program został zmodyfikowany pomyślnie!'
        });

        Backbone.history.navigate('programs/' + program.id, true);
      },
      error: function(_, errors)
      {
        viewport.msg.show({
          type: 'error',
          time: 5000,
          text: 'Nie udało się zmodyfikować programu :('
        });
      }
    });

    return false;
  };

  return EditProgramFormView;
});
