import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Prohibit {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>, guards: string[]) {
    const userEmail = ctx.auth.user?.email || ctx.request.body()?.email
    for (const email of guards) {
      if (userEmail === email) {
        return ctx.response.unauthorized({
          message: 'You do not have the permission',
        })
      }
    }
    return await next()
  }
}
