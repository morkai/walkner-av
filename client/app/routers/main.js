// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-av project <http://lukasz.walukiewicz.eu/p/walkner-av>

define(
[
  './HomeRouter',
  './HistoryRouter',
  './ProgramsRouter',
  './UsersRouter'
],
/**
 * @param {function(new:HomeRouter)} HomeRouter
 * @param {function(new:HomeRouter)} HistoryRouter
 * @param {function(new:ProgramsRouter)} ProgramsRouter
 * @param {function(new:UsersRouter)} UsersRouter
 */
function(
  HomeRouter,
  HistoryRouter,
  ProgramsRouter,
  UsersRouter)
{
  return function(options)
  {
    new HomeRouter(options);
    new HistoryRouter(options);
    new ProgramsRouter(options);
    new UsersRouter(options);
  };
});
