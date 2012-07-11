define(
[
  'jQuery',
  'Underscore',
  'Backbone',

  'text!app/templates/programs/details.html'
],
/**
 * @param {jQuery} $
 * @param {Underscore} _
 * @param {Backbone} Backbone
 * @param {String} detailsTpl
 */
function(
  $,
  _,
  Backbone,
  detailsTpl)
{
  /**
   * @class ProgramDetailsView
   * @constructor
   * @extends Backbone.View
   * @param {Object} [options]
   */
  var ProgramDetailsView = Backbone.View.extend({
    template: _.template(detailsTpl)
  });

  ProgramDetailsView.prototype.initialize = function()
  {

  };

  ProgramDetailsView.prototype.destroy = function()
  {
    this.remove();
  };

  ProgramDetailsView.prototype.render = function()
  {
    var program = this.model.toTemplateData();

    this.el.innerHTML = this.template({program: program});

    return this;
  };

  return ProgramDetailsView;
});
