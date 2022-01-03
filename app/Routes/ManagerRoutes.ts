import Route from '@ioc:Adonis/Core/Route'

Route.get('/api/managers/:manager_id/users', 'ManagerController.getAllUsers').middleware([
  'auth',
  'level:ADMIN,MANAGER',
])

Route.get(
  '/api/managers/:manager_id/users/tasks',
  'ManagerController.getAllTasksOfUsers'
).middleware(['auth', 'level:ADMIN,MANAGER'])
