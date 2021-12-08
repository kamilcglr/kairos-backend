import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User, { Role } from 'App/Models/app/User'

export default class UserController {
  public async createUser(ctx: HttpContextContract) {
    const payload = await ctx.request.validate({
      schema: schema.create({
        email: schema.string({ trim: true }, [
          rules.email(),
          rules.unique({ table: 'app.kairos_user', column: 'email', caseInsensitive: true }),
        ]),

        firstname: schema.string(),
        lastname: schema.string(),
        password: schema.string({}, [
          rules.regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[()#?!@$%^&*+\-_]).{8,}$/),
        ]),
        role: schema.enum(['MANAGER', 'USER']),
        manager_id: schema.number.optional([
          rules.exists({
            table: 'app.sensor_type',
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
      let managerId
      switch (ctx.user.role) {
        case Role.ADMIN:
          managerId = payload.manager_id || null
          break
        case Role.MANAGER:
          managerId = ctx.user.id
          break
      }
      const createdUser = await User.create({
        firstname: payload.firstname,
        lastname: payload.lastname,
        email: payload.email,
        managerId: managerId,
        role: payload.role,
      })

      return ctx.response.created(createdUser)
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }
}
