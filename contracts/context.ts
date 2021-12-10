declare module '@ioc:Adonis/Core/HttpContext' {
  import User from 'App/Models/app/User'
  import Project from 'App/Models/app/Project'
  import Task from 'App/Models/app/Task'

  interface HttpContextContract {
    auth: {
      user: User
    }
    user: User
    project: Project
    task: Task
  }
}
