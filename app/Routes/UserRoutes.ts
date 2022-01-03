import Route from '@ioc:Adonis/Core/Route'

Route.post('/api/users', 'UserController.create').middleware(['auth', 'level:ADMIN,MANAGER'])

Route.patch('/api/users/:user_id', 'UserController.patch')
  .where('user_id', Route.matchers.number())
  .middleware(['auth', 'level:ADMIN,MANAGER,USER', 'access:user'])

Route.delete('/api/users/:user_id', 'UserController.delete')
  .where('user_id', Route.matchers.number())
  .middleware(['auth', 'level:ADMIN,MANAGER', 'access:user'])

Route.get('/api/users', 'UserController.getAll').middleware(['auth', 'level:ADMIN'])
Route.get('/api/users/:user_id', 'UserController.get').middleware([
  'auth',
  'level:ADMIN,MANAGER,USER',
  'access:user',
])
