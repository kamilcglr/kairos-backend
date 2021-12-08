import Route from '@ioc:Adonis/Core/Route'

Route.post('/api/users', 'UserController.createUser').middleware(['auth', 'level:ADMIN,MANAGER'])
