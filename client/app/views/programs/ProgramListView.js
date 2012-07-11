define(
[
  'jQuery',
  'Underscore',
  'Backbone',

  'app/views/viewport',
  'app/views/PageLayout',
  'app/views/ListView'
],
/**
 * @param {jQuery} $
 * @param {Underscore} _
 * @param {Backbone} Backbone
 * @param {Viewport} viewport
 * @param {function(new:PageLayout)} PageLayout
 * @param {function(new:ListView)} ListView
 */
function($, _, Backbone, viewport, PageLayout, ListView)
{
  /**
   * @class ProgramListView
   * @constructor
   * @extends ListView
   * @param {Object} [options]
   */
  var ProgramListView = ListView.extend({
    helpHash: 'programs-browse',
    layout: PageLayout,
    title: 'Programy',
    className: 'programs',
    breadcrumbs: ['Programy'],
    actions: [
      {
        href: '#programs;add',
        text: 'Dodaj',
        className: 'blue add-program action',
        privileges: 'managePrograms'
      }
    ]
  });

  return ProgramListView;
});
