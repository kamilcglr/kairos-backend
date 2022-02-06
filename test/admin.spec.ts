import test from 'japa'
import supertest from 'supertest'
import User from 'App/Models/app/User'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

const getHeaders = () => {
  return {
    Authorization: 'Bearer ' + global.tokenAdmin,
    Accept: 'application/json',
  }
}

test.group('USER TESTS', () => {
  test('Get user info', async (assert) => {
    assert.plan(2)

    const response = await supertest(BASE_URL).get('/api/auth/user').set(getHeaders()).send()

    const expected = {
      id: global.admin.id,
      firstname: global.admin.firstname,
      lastname: global.admin.lastname,
      email: global.admin.email,
      role: 'ADMIN',
      manager_id: null,
      full_name: 'Admin Admin',
      initials: 'AA',
    }

    assert.equal(response.text, JSON.stringify(expected))
    assert.equal(response.statusCode, 200)
  })

  test('Create Manager', async (assert) => {
    const response = await supertest(BASE_URL).post('/api/users').set(getHeaders()).send({
      email: 'managertest@email.com',
      password: 'testTEST1234*',
      firstname: 'Jack',
      lastname: 'Black',
      role: 'MANAGER',
    })
    const expectedId = response.body.id

    const manager = await User.find(expectedId)
    global.manager = manager
    assert.equal(response.statusCode, 201)
    assert.isNotNull(manager)
    assert.equal(manager!.id, expectedId)
  })

  test('Delete User', async (assert) => {
    const response = await supertest(BASE_URL).post('/api/users').set(getHeaders()).send({
      email: 'usertest2@email.com',
      password: 'testTEST1234*',
      firstname: 'John',
      lastname: 'Doe',
      role: 'USER',
      managerId: global.manager.id,
    })
    const createdId = response.body.id

    const user2 = await User.find(createdId)
    assert.equal(response.statusCode, 201)
    assert.isNotNull(user2)
    assert.equal(user2!.id, createdId)

    const deleteResponse = await supertest(BASE_URL)
      .delete(`/api/users/${user2!.id}`)
      .set(getHeaders())
      .send()
    assert.equal(deleteResponse.statusCode, 200)

    const user = await User.find(createdId)
    assert.isNull(user)
  })
})
