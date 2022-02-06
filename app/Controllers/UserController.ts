import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User, { Role } from 'App/Models/app/User'

export default class UserController {
  public async getAuthenticatedUser(ctx: HttpContextContract) {
    try {
      return ctx.response.ok(ctx.auth.user)
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }
  public async getAll(ctx: HttpContextContract) {
    try {
      const users = await User.query().preload('manager').preload('users')
      return ctx.response.ok(users)
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }
  public async get(ctx: HttpContextContract) {
    try {
      return ctx.response.ok(ctx.user)
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }
  public async create(ctx: HttpContextContract) {
    const payload = await ctx.request.validate({
      schema: schema.create({
        email: schema.string({ trim: true }, [
          rules.email(),
          rules.unique({ table: 'app.kairos_user', column: 'email', caseInsensitive: true }),
        ]),
        firstname: schema.string(),
        lastname: schema.string(),
        password: schema.string({}, [
          // rules.regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[()#?!@$%^&*+\-_]).{8,}$/),
        ]),
        role: schema.enum.optional(['ADMIN', 'MANAGER', 'USER']),
        manager_id: schema.number.optional([
          rules.exists({
            table: 'app.kairos_user',
            column: 'id',
            where: {
              role: Role.MANAGER,
            },
          }),
        ]),
      }),
      messages: {
        'email.unique': 'User with the same email already exists',
        'manager_id.exists': 'This manager does not exist',
      },
    })

    try {
      const createdUser = await User.create({
        firstname: payload.firstname,
        lastname: payload.lastname,
        email: payload.email,
        password: payload.password,
        managerId: isAdmin(ctx) ? payload.manager_id || null : ctx.auth.user.id,
        role: isAdmin(ctx) ? payload.role : Role.USER,
      })

      return ctx.response.created(createdUser)
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }

  public async patch(ctx: HttpContextContract) {
    const payload = await ctx.request.validate({
      schema: schema.create({
        email: schema.string.optional({ trim: true }, [
          rules.email(),
          rules.unique({
            table: 'app.kairos_user',
            column: 'email',
            caseInsensitive: true,
            whereNot: { id: ctx.user.id },
          }),
        ]),
        firstname: schema.string.optional(),
        lastname: schema.string.optional(),
        role: schema.enum.optional(['ADMIN', 'MANAGER', 'USER']),
        manager_id: schema.number.optional([
          rules.exists({
            table: 'app.kairos_user',
            column: 'id',
            where: {
              role: Role.MANAGER,
            },
          }),
        ]),
      }),
      messages: {
        'email.unique': 'User with the same email already exists',
        'manager_id.exists': 'This manager does not exist',
      },
    })

    try {
      const updatedUser = await ctx.user
        .merge({
          firstname: payload.firstname,
          lastname: payload.lastname,
          email: payload.email,
          managerId: isAdmin(ctx)
            ? payload.manager_id || null
            : isManager(ctx)
            ? ctx.auth.user.id
            : ctx.user.managerId,
          role: isAdmin(ctx) ? payload.role : Role.USER,
        })
        .save()
      await ctx.user.refresh()

      return ctx.response.ok(updatedUser)
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }

  public async delete(ctx: HttpContextContract) {
    await ctx.bouncer.authorize('deleteUser')

    try {
      await ctx.user.delete()
      return ctx.response.ok({ message: 'User successfully deleted' })
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }
}

function isAdmin(ctx): boolean {
  return ctx.auth.user.role === Role.ADMIN
}

function isManager(ctx): boolean {
  return ctx.auth.user.role === Role.MANAGER
}
