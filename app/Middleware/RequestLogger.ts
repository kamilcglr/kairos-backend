import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RequestLogger {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const request = ctx.request.method() + ' ' + ctx.request.url()
    ctx.logger.info(request)
    await next()
  }
}
