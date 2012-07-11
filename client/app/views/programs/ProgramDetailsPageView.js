define(
[
  'jQuery',
  'Underscore',
  'Backbone',

  'app/user',
  'app/models/History',
  'app/views/viewport',
  'app/views/PageLayout',
  'app/views/history/HistoryEntriesTableView',
  'app/views/programs/ProgramDetailsView',
  'app/views/programs/DeleteProgramView',

  'text!app/templates/programs/detailsPage.html'
],
/**
 * @param {jQuery} $
 * @param {Underscore} _
 * @param {Backbone} Backbone
 * @param {Object} user
 * @param {Object} History
 * @param {Viewport} viewport
 * @param {function(new:PageLayout)} PageLayout
 * @param {function(new:HistoryEntriesTableView)} HistoryEntriesTableView
 * @param {function(new:ProgramDetailsView)} ProgramDetailsView
 * @param {function(new:DeleteProgramView)} DeleteProgramView
 * @param {String} detailsPageTpl
 */
function(
  $,
  _,
  Backbone,
  user,
  History,
  viewport,
  PageLayout,
  HistoryEntriesTableView,
  ProgramDetailsView,
  DeleteProgramView,
  detailsPageTpl)
{
  /**
   * @class ProgramDetailsPageView
   * @constructor
   * @extends Backbone.View
   * @param {Object} [options]
   */
  var ProgramDetailsPageView = Backbone.View.extend({
    helpHash: 'programs-view',
    className: 'programDetailsPage',
    template: _.template(detailsPageTpl),
    layout: PageLayout,
    breadcrumbs: function()
    {
      return [
        {href: '#programs', text: 'Programy'},
        this.model.get('name')
      ];
    },
    actions: function()
    {
      var model = this.model;
      var id = model.id;
      var privileges = ['managePrograms'];

      if (this.model.get('predefined') !== 0)
      {
        privileges.push('predefinePrograms');
      }

      return [
        {
          href: '#programs/' + id + ';edit',
          text: 'Edytuj',
          privileges: privileges
        },
        {
          id: 'deleteProgramAction',
          href: '#programs/' + id + ';delete',
          text: 'Usuń',
          privileges: privileges,
          handler: function(e)
          {
            if (e.button !== 0)
            {
              return;
            }

            if ($(this).hasClass('disabled'))
            {
              return false;
            }

            viewport.showDialog(new DeleteProgramView({model: model}));

            return false;
          }
        }
      ];
    }
  });

  ProgramDetailsPageView.prototype.initialize = function()
  {
    this.detailsView = null;
    this.historyView = null;
  };

  ProgramDetailsPageView.prototype.destroy = function()
  {
    _.destruct(this, 'detailsView', 'historyView');

    this.remove();
  };

  ProgramDetailsPageView.prototype.render = function()
  {
    _.destruct(this, 'detailsView', 'historyView');

    this.el.innerHTML = this.template();

    this.detailsView = new ProgramDetailsView({model: this.model});
    this.detailsView.render();

    this.$('.details').append(this.detailsView.el);

    var historyEl = this.$('.history').hide();

    if (user.isAllowedTo('viewHistory'))
    {
      var history = new History();
      var self = this;

      history.fetch({
        data: {
          page: 1,
          limit: 5,
          conditions: {programId: this.model.id},
          fields: {
            programName: 1,
            startedAt: 1,
            finishedAt: 1,
            finishState: 1
          }
        },
        success: function()
        {
          if (!history.length)
          {
            return;
          }

          self.historyView = new HistoryEntriesTableView({
            showProgramName: false,
            collection: history
          });
          self.historyView.render();

          historyEl.append(self.historyView.el).show();
        }
      });
    }

    if (this.model.get('predefined') !== 0)
    {
      $('#deleteProgramAction').addClass('disabled');
    }

    return this;
  };

  return ProgramDetailsPageView;
});
