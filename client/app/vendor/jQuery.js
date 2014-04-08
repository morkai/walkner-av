// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-av <http://lukasz.walukiewicz.eu/p/walkner-av>

define(
[
  'vendor/form2js-min.js',
  'vendor/chosen/chosen.jquery-min.js'
],
function()
{
  $.ajaxSetup({
    cache: false
  });

  $.fn.fromObject = function(obj)
  {
    js2form(this[0], obj);
  };

  return $.noConflict();
});
