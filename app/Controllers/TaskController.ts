import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Task from 'App/Models/app/Task'
import { rules, schema } from '@ioc:Adonis/Core/Validator'

export default class TaskController {
  public async getUserTasks(ctx: HttpContextContract) {
    try {
      const tasks = await Task.query().where('userId', ctx.user.id)
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
        end: schema.date({}, [rules.afterField('start')]),
      }),
    })

    try {
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
}
