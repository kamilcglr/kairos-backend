import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Project from 'App/Models/app/Project'

export default class ProjectController {
  public async create(ctx: HttpContextContract) {
    const payload = await ctx.request.validate({
      schema: schema.create({
        name: schema.string({ trim: true }, [
          rules.unique({ table: 'app.project', column: 'name', caseInsensitive: true }),
        ]),
        description: schema.string(),
      }),
      messages: {
        'name.unique': 'Project with the same email already exists',
      },
    })

    try {
      const createdProject = await Project.create({
        name: payload.name,
        description: payload.description,
      })

      return ctx.response.created(createdProject)
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }

  public async update(ctx: HttpContextContract) {
    const payload = await ctx.request.validate({
      schema: schema.create({
        name: schema.string({ trim: true }, [
          rules.unique({
            table: 'app.project',
            column: 'name',
            caseInsensitive: true,
            whereNot: { id: ctx.project.id },
          }),
        ]),
        description: schema.string(),
      }),
      messages: {
        'name.unique': 'Project with the same email already exists',
      },
    })

    try {
      await ctx.project
        .merge({
          name: payload.name,
          description: payload.description,
        })
        .save()

      return ctx.response.ok(ctx.project)
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }

  public async delete(ctx: HttpContextContract) {
    try {
      await ctx.project.delete()

      return ctx.response.ok({ message: 'Project successfully deleted' })
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }

  public async getAll(ctx: HttpContextContract) {
    try {
      const projects = await Project.all()
      return ctx.response.ok(projects)
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }

  public async get(ctx: HttpContextContract) {
    try {
      return ctx.response.ok(ctx.project)
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }
}
