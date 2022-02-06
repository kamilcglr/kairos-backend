import test from 'japa'
import supertest from 'supertest'
import User from 'App/Models/app/User'
import Env from '@ioc:Adonis/Core/Env'
import TaskProject from 'App/Models/app/Project'
import Task from 'App/Models/app/Task'
import { DateTime } from 'luxon'

const jwt = require('jsonwebtoken')

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

const getHeaders = () => {
  const now = Math.floor(Date.now() / 1000)
  let token = jwt.sign(
    { sub: global.manager.email, exp: now + 60 * 15 },
    Env.get('JWT_CONFIG_KEY'),
    {
      algorithm: 'HS512',
    }
  )
  return {
    Authorization: 'Bearer ' + token,
    Accept: 'application/json',
  }
}

let createdProject: TaskProject | null = null

test.group('MANAGER TESTS', () => {
  test('Create User', async (assert) => {
    const response = await supertest(BASE_URL).post('/api/users').set(getHeaders()).send({
      email: 'usertest@email.com',
      password: 'testTEST1234*',
      firstname: 'John',
      lastname: 'Doe',
      role: 'USER',
      managerId: global.manager.id,
    })
    const expectedId = response.body.id

    const user = await User.find(expectedId)
    global.user = user
    assert.equal(response.statusCode, 201)
    assert.isNotNull(user)
    assert.equal(user!.id, expectedId)
  })

  test('Patch User', async (assert) => {
    const response = await supertest(BASE_URL)
      .patch(`/api/users/${global.user.id}`)
      .set(getHeaders())
      .send({
        firstname: 'Ahmed',
      })

    const user = await User.find(global.user.id)
    assert.equal(response.statusCode, 200)
    assert.isNotNull(user)
    assert.equal(user?.firstname, 'Ahmed')
  })

  test('Create Project', async (assert) => {
    const response = await supertest(BASE_URL).post(`/api/projects`).set(getHeaders()).send({
      name: 'Test project xx',
      description: 'Lorem ipsum',
    })

    createdProject = await TaskProject.find(response.body.id)
    assert.equal(response.statusCode, 201)
    assert.isNotNull(createdProject)
    assert.equal(createdProject?.name, 'Test project xx')
  })

  test('Update Project', async (assert) => {
    const response = await supertest(BASE_URL)
      .patch(`/api/projects/${createdProject?.id}`)
      .set(getHeaders())
      .send({
        description: 'Dolor sit amet',
      })

    const project = await TaskProject.find(response.body.id)
    assert.equal(response.statusCode, 200)
    assert.isNotNull(project)
    assert.equal(project?.description, 'Dolor sit amet')
  })

  test('Get manager users', async (assert) => {
    // create user and affect it to manager
    const createdUser = await User.create({
      email: 'test42@kairos.com',
      firstname: 'Oliver',
      lastname: 'Twist',
      password: 'WeakPassword1%',
      managerId: global.manager.id,
    })

    const response = await supertest(BASE_URL)
      .get(`/api/managers/${global.manager.id}/users`)
      .set(getHeaders())
      .send()

    const users = response.body
    assert.equal(response.statusCode, 200)
    assert.isTrue(users.some((u) => u.id === createdUser.id))
  })

  test('Get manager users tasks', async (assert) => {
    // create user and affect it to manager
    const tasks = await Task.createMany([
      {
        name: 'Spring boot',
        description: 'Lorem ipsum',
        userId: global.user.id,
        projectId: createdProject?.id,
        start: DateTime.now().minus({ hour: 1 }),
        end: DateTime.now(),
      },
      {
        name: 'AdonisJS',
        description: 'Sit dolor',
        userId: global.user.id,
        projectId: createdProject?.id,
        start: DateTime.now().minus({ hour: 1 }),
        end: DateTime.now(),
      },
    ])

    const response = await supertest(BASE_URL)
      .get(`/api/managers/${global.manager.id}/users`)
      .set(getHeaders())
      .send()

    assert.equal(response.statusCode, 200)
    assert.isTrue(tasks.length === response.body.length)
    assert.isTrue(tasks.some((t) => t.id === tasks[0].id))
  })

  test('Get user tasks', async (assert) => {
    const tasks2 = await Task.createMany([
      {
        name: 'Spring boot',
        description: 'Lorem ipsum',
        userId: global.user.id,
        projectId: createdProject?.id,
        start: DateTime.now().minus({ hour: 1 }),
        end: DateTime.now(),
      },
      {
        name: 'AdonisJS',
        description: 'Sit dolor',
        userId: global.user.id,
        projectId: createdProject?.id,
        start: DateTime.now().minus({ hour: 1 }),
        end: DateTime.now(),
      },
    ])

    const response = await supertest(BASE_URL)
      .get(`/api/users/${global.user.id}/tasks`)
      .set(getHeaders())
      .send()

    assert.isTrue(response.body.length > 2)
    assert.isTrue(response.body.some((t) => t.id === tasks2[0]?.id))
    assert.isTrue(response.body.some((t) => t.id === tasks2[1]?.id))
  })
})
