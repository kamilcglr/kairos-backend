import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User, { Role } from 'App/Models/app/User'
import { rules, schema } from '@ioc:Adonis/Core/Validator'

export default class ManagerController {
  public async getAllUsers(ctx: HttpContextContract) {
    const payload = await ctx.request.validate({
      schema: schema.create({
        params: schema.object().members({
          manager_id: schema.number([
            rules.exists({
              table: 'app.kairos_user',
              column: 'id',
              where: {
                role: Role.MANAGER,
              },
            }),
          ]),
        }),
      }),
    })
    try {
      const manager = await User.query()
        .where('id', payload.params.manager_id)
        .preload('users', (users) => users.preload('tasks'))
        .firstOrFail()

      return ctx.response.ok(manager.users)
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }

  public async getAllTasksOfUsers(ctx: HttpContextContract) {
    const payload = await ctx.request.validate({
      schema: schema.create({
        params: schema.object().members({
          manager_id: schema.number([
            rules.exists({
              table: 'app.kairos_user',
              column: 'id',
              where: {
                role: Role.MANAGER,
              },
            }),
          ]),
        }),
      }),
    })
    try {
      const users = await User.query()
        .where('id', payload.params.manager_id)
        .preload('users')
        .preload('tasks')
      return ctx.response.ok(users)
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }
}
