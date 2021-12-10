import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User, { Role } from 'App/Models/app/User'
import Project from 'App/Models/app/Project'
import Task from 'App/Models/app/Task'

export default class Access {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>, guards?: string[]) {
    const guard = guards && guards.length > 0 ? guards[0] : 'null'

    if (guard === 'user') {
      return await this.accessToUser(ctx, next)
    } else if (guard === 'project') {
      return await this.accessToProject(ctx, next)
    } else if (guard === 'task') {
      return await this.accessToTask(ctx, next)
    } else return await next()
  }

  private async accessToUser(ctx: HttpContextContract, next: () => Promise<void>) {
    let user: User | null

    try {
      user = await User.query().where('id', ctx.request.param('user_id')).preload('manager').first()

      if (!user) {
        return ctx.response.notFound({ message: 'User not found' })
      }

      switch (ctx.auth.user.role) {
        case Role.USER:
          if (user.id !== ctx.auth.user.id) {
            return ctx.response.unauthorized({
              message: 'You do not have the permission',
            })
          }
          break
        case Role.MANAGER:
          if (user.managerId !== ctx.auth.user.id && user.id !== ctx.auth.user.id) {
            return ctx.response.unauthorized({
              message: 'You do not have the permission',
            })
          }
          break
        case Role.ADMIN:
          break
        default:
          return ctx.response.unauthorized({
            message: 'You do not have the permission',
          })
      }
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError({ message: 'Internal server error' })
    }
    ctx.user = user
    return await next()
  }

  private async accessToProject(ctx: HttpContextContract, next: () => Promise<void>) {
    let project: Project | null

    try {
      project = await Project.find(ctx.request.param('project_id'))
      if (!project) {
        return ctx.response.notFound({ message: 'Project not found' })
      }

      switch (ctx.auth.user.role) {
        case Role.USER:
          break
        case Role.MANAGER:
          break
        case Role.ADMIN:
          break
        default:
          return ctx.response.unauthorized({
            message: 'You do not have the permission',
          })
      }
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError({ message: 'Internal server error' })
    }
    ctx.project = project
    return await next()
  }

  private async accessToTask(ctx: HttpContextContract, next: () => Promise<void>) {
    let task: Task | null

    try {
      task = await Task.find(ctx.request.param('task_id'))
      if (!task) {
        return ctx.response.notFound({ message: 'Task not found' })
      }

      switch (ctx.auth.user.role) {
        case Role.USER:
          if (task.userId !== ctx.auth.user.id) {
            return ctx.response.unauthorized({
              message: 'You do not have the permission',
            })
          }
          break
        case Role.MANAGER:
          break
        case Role.ADMIN:
          break
        default:
          return ctx.response.unauthorized({
            message: 'You do not have the permission',
          })
      }
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError({ message: 'Internal server error' })
    }
    ctx.task = task
    return await next()
  }
}
