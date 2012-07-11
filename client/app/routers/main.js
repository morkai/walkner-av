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
