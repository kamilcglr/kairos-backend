import Route from '@ioc:Adonis/Core/Route'

Route.get('/api/users/:user_id/tasks', 'TaskController.getUserTasks')
  .where('user_id', Route.matchers.number())
  .middleware(['auth', 'level:ADMIN,MANAGER,USER', 'access:user'])

Route.post('/api/projects/:project_id/tasks', 'TaskController.create')
  .where('project_id', Route.matchers.number())
  .middleware(['auth', 'level:ADMIN,MANAGER,USER', 'access:project'])

Route.patch('/api/projects/:project_id/tasks/:task_id', 'TaskController.patch')
  .where('project_id', Route.matchers.number())
  .where('task_id', Route.matchers.number())
  .middleware(['auth', 'level:ADMIN,MANAGER,USER', 'access:project', 'access:task'])

Route.get('/api/projects/:project_id/tasks/:task_id', 'TaskController.get')
  .where('project_id', Route.matchers.number())
  .where('task_id', Route.matchers.number())
  .middleware(['auth', 'level:ADMIN,MANAGER,USER', 'access:project', 'access:task'])
