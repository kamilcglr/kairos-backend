import Route from '@ioc:Adonis/Core/Route'

Route.post('/api/users/:user_id/reports', 'ReportController.generatePDF')
  .where('user_id', Route.matchers.number())
  .middleware(['auth', 'level:ADMIN,MANAGER,USER', 'access:user'])

Route.get('/api/users/:user_id/reports', 'ReportController.getReports')
  .where('user_id', Route.matchers.number())
  .middleware(['auth', 'level:ADMIN,MANAGER,USER', 'access:user'])

Route.get('/api/users/:user_id/reports/:report_id', 'ReportController.getReport')
  .where('user_id', Route.matchers.number())
  .where('report_id', Route.matchers.number())
  .middleware(['auth', 'level:ADMIN,MANAGER,USER', 'access:user'])

Route.delete('/api/users/:user_id/reports/:report_id', 'ReportController.deleteReport')
  .where('user_id', Route.matchers.number())
  .where('report_id', Route.matchers.number())
  .middleware(['auth', 'level:ADMIN,MANAGER', 'access:user'])
