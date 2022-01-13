import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Task from 'App/Models/app/Task'
import { rules, schema } from '@ioc:Adonis/Core/Validator'

export default class TaskController {
  public async getUserTasks(ctx: HttpContextContract) {
    try {
      const tasks = await Task.query().where('userId', ctx.user.id).orderBy('start', 'desc')
      return ctx.response.ok(tasks)
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }

  public async create(ctx: HttpContextContract) {
    const payload = await ctx.request.validate({
      schema: schema.create({
        name: schema.string(),
        description: schema.string.optional(),
        start: schema.date(),
        end: schema.date({}, [rules.afterField('start'), rules.before(1, 'seconds')]),
      }),
    })

    try {
      await ctx.auth.user.load('frozenMonths')
      if (
        ctx.auth.user.frozenMonths
          .map((f) => f.month.startOf('month'))
          .some((month) => month.equals(payload.start.startOf('month')))
      ) {
        return ctx.response.forbidden({ message: 'This month is frozen.' })
      }

      const task = await Task.create({
        name: payload.name,
        description: payload.description,
        start: payload.start,
        end: payload.end,
        userId: ctx.auth.user.id,
        projectId: ctx.project.id,
      })
      return ctx.response.created(task)
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }

  public async patch(ctx: HttpContextContract) {
    const payload = await ctx.request.validate({
      schema: schema.create({
        name: schema.string(),
        description: schema.string.optional(),
        start: schema.date(),
        end: schema.date({}, [rules.afterField('start')]),
      }),
    })

    try {
      await ctx.auth.user.load('frozenMonths')
      if (ctx.task.frozenMonthId) {
        return ctx.response.forbidden({ message: 'This task is frozen.' })
      }
      if (
        ctx.auth.user.frozenMonths
          .map((f) => f.month.startOf('month'))
          .some((month) => month.equals(payload.start.startOf('month')))
      ) {
        return ctx.response.forbidden({ message: 'This month is frozen.' })
      }

      await ctx.task
        .merge({
          name: payload.name,
          description: payload.description,
          start: payload.start,
          end: payload.end,
        })
        .save()
      return ctx.response.ok(ctx.task)
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }

  public async get(ctx: HttpContextContract) {
    try {
      return ctx.response.ok(ctx.task)
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }

  public async delete(ctx: HttpContextContract) {
    try {
      if (ctx.task.frozenMonthId) {
        return ctx.response.forbidden({ message: 'This task is in a frozen month.' })
      }
      await ctx.task.delete()
      return ctx.response.noContent()
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }
}
