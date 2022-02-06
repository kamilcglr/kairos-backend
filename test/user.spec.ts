import test from 'japa'
import supertest from 'supertest'
import Env from '@ioc:Adonis/Core/Env'
import TaskProject from 'App/Models/app/Project'
import Task from 'App/Models/app/Task'

const jwt = require('jsonwebtoken')

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
let projects: TaskProject[]
let task: Task | null
const getHeaders = () => {
  const now = Math.floor(Date.now() / 1000)
  let token = jwt.sign({ sub: global.user.email, exp: now + 60 * 15 }, Env.get('JWT_CONFIG_KEY'), {
    algorithm: 'HS512',
  })
  return {
    Authorization: 'Bearer ' + token,
    Accept: 'application/json',
  }
}

test.group('USER TESTS', () => {
  test('User cannot create user', async (assert) => {
    const response = await supertest(BASE_URL).post('/api/users').set(getHeaders()).send({
      email: 'usertest@email.com',
      password: 'testTEST1234*',
      firstname: 'John',
      lastname: 'Doe',
      role: 'USER',
      managerId: global.manager.id,
    })

    assert.equal(response.statusCode, 401)
  })

  test('Get all projects', async (assert) => {
    const response = await supertest(BASE_URL).get('/api/projects').set(getHeaders()).send()
    projects = response.body
    assert.equal(response.statusCode, 200)
    assert.isTrue(projects.length > 0)
  })

  test('Create task', async (assert) => {
    const response = await supertest(BASE_URL)
      .post(`/api/projects/${projects[0].id}/tasks`)
      .set(getHeaders())
      .send({
        name: 'Test task xx',
        description: 'Lorem ipsum',
        start: '2021-11-09T11:59:26.562+01:00',
        end: '2021-12-09T12:22:00.562+01:00',
      })

    task = await Task.find(response.body.id)
    assert.equal(response.statusCode, 201)
    assert.isNotNull(task)
    assert.equal(task?.name, 'Test task xx')
  })

  test('Update task', async (assert) => {
    const response = await supertest(BASE_URL)
      .patch(`/api/projects/${projects[0].id}/tasks/${task?.id}`)
      .set(getHeaders())
      .send({
        name: 'Test task updated',
        start: '2022-11-09T11:59:26.562+01:00',
        end: '2022-12-09T12:22:00.562+01:00',
      })

    let updated = await Task.find(task?.id)
    assert.equal(response.statusCode, 200)
    assert.isNotNull(updated)
    assert.equal(updated?.start.toISO(), '2022-11-09T11:59:26.562+01:00')
    assert.equal(updated?.end.toISO(), '2022-12-09T12:22:00.562+01:00')
  })

  test('Delete task', async (assert) => {
    const response = await supertest(BASE_URL)
      .delete(`/api/projects/${projects[0].id}/tasks/${task?.id}`)
      .set(getHeaders())
      .send()

    let deleted = await Task.find(task?.id)
    assert.equal(response.statusCode, 204)
    assert.isNull(deleted)
  })

  test('Cannot create when already frozen report', async (assert) => {
    const response = await supertest(BASE_URL)
      .post(`/api/users/${global.user.id}/reports`)
      .set(getHeaders())
      .send({
        month: '2020-12',
      })

    assert.equal(response.statusCode, 201)
  })
})
