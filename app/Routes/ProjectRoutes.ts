import Route from '@ioc:Adonis/Core/Route'

Route.post('/api/projects', 'ProjectController.create').middleware(['auth', 'level:ADMIN,MANAGER'])

Route.patch('/api/projects/:project_id', 'ProjectController.update')
  .where('project_id', Route.matchers.number())
  .middleware(['auth', 'level:ADMIN,MANAGER', 'access:project'])

Route.delete('/api/projects/:project_id', 'ProjectController.delete')
  .where('project_id', Route.matchers.number())
  .middleware(['auth', 'level:ADMIN', 'access:project'])

Route.get('/api/projects', 'ProjectController.getAll').middleware([
  'auth',
  'level:ADMIN,MANAGER,USER',
])

Route.get('/api/projects/:project_id', 'ProjectController.get')
  .where('project_id', Route.matchers.number())
  .middleware(['auth', 'level:ADMIN,MANAGER,USER', 'access:project'])
