import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/app/User'

const jwt = require('jsonwebtoken')

export default class Auth {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    let user
    try {
      const token = ctx.request.header('authorization')?.replace('Bearer ', '')
      if (!token) {
        return ctx.response.unauthorized({
          message: 'No token provided',
        })
      }

      user = await verifyToken(token)

      if (!user) {
        return ctx.response.unauthorized({
          message: 'Session expired',
        })
      }
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError({ message: 'Internal server error' })
    }
    ctx.user = user
    return await next()
  }
}

const verifyToken = async function (token: string) {
  try {
    const decoded = jwt.verify(token, Env.get('JWT_CONFIG_KEY'), {
      algorithms: ['HS512'],
    }) // If expired -> catch

    return await User.findByOrFail('email', decoded.sub)
  } catch (e) {
    console.log(e)
    return null
  }
}
