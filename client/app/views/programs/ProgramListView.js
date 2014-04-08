// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-av <http://lukasz.walukiewicz.eu/p/walkner-av>

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
