import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Level {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>, guards: string[]) {
    for (const role of guards) {
      if (ctx.auth.user.role === role) {
        return await next()
      }
    }
    return ctx.response.unauthorized({
      message: 'You do not have the permission',
    })
  }
}
