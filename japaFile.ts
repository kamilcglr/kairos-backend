import 'reflect-metadata'
import { join } from 'path'
import getPort from 'get-port'
import { configure } from 'japa'
import sourceMapSupport from 'source-map-support'

const jwt = require('jsonwebtoken')

process.env.NODE_ENV = 'testing'
process.env.ADONIS_ACE_CWD = join(__dirname)
sourceMapSupport.install({ handleUncaughtExceptions: false })

async function startHttpServer() {
  const { Ignitor } = await import('@adonisjs/core/build/src/Ignitor')
  process.env.PORT = String(await getPort())
  await new Ignitor(__dirname).httpServer().start()
}

async function setupDatabase() {
  /** BEGIN GLOBAL TRANSACTION **/
  const { default: Database } = await import('@ioc:Adonis/Lucid/Database')
  const { default: Env } = await import('@ioc:Adonis/Core/Env')

  await Database.beginGlobalTransaction('pg')

  /** CREATE OBJECTS **/
  const { default: User } = await import('App/Models/app/User')

  const user = new User()
  await user
    .fill({
      firstname: 'Admin',
      lastname: 'Admin',
      email: 'admin@kairos.com',
      password: 'testPassword1%',
      role: 'ADMIN',
    })
    .save()

  global.admin = user
  global.manager = null
  global.user = null
  const now = Math.floor(Date.now() / 1000)

  global.tokenAdmin = jwt.sign({ sub: user.email, exp: now + 60 * 15 }, Env.get('JWT_CONFIG_KEY'), {
    algorithm: 'HS512',
  })
}

async function rollbackDatabase() {
  /** ROLLBACK GLOBAL TRANSACTION **/
  const { default: Database } = await import('@ioc:Adonis/Lucid/Database')
  await Database.rollbackGlobalTransaction('pg')
}

/**
 * Configure test runner
 */
configure({
  files: ['test/admin.spec.ts', 'test/manager.spec.ts', 'test/user.spec.ts'],

  before: [startHttpServer, setupDatabase],
  after: [rollbackDatabase],

  timeout: 10000,
})
