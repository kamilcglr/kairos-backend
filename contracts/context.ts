declare module '@ioc:Adonis/Core/HttpContext' {
  import User from 'App/Models/app/User'

  interface HttpContextContract {
    user: User
  }
}
