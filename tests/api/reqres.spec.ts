import { test, expect } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config()

test.describe('Reqres - API Tests', () => {
  test('C1 - Listar usuários e validar dados', async ({ request }) => {
    try {
      // 1. Realizar a requisição GET /users?page=2
      const response = await request.get(process.env.API_BASE_URL + '/users?page=2')

      // 2. Obtenha o corpo da resposta em formato JSON
      const body = await response.json()

      // 3. Valide o conteúdo retornado, verificando se os usuários possuem os campos corretos (`id`, `first_name`, `last_name`, `email`).
      expect(body.data).toBeDefined()
      expect(Array.isArray(body.data)).toBeTruthy()

      body.data.forEach((user: any) => {
        expect(user).toHaveProperty('id')
        expect(user).toHaveProperty('email')
        expect(user).toHaveProperty('first_name')
        expect(user).toHaveProperty('last_name')

        expect(typeof user.id).toBe('number')
        expect(typeof user.email).toBe('string')
        expect(typeof user.first_name).toBe('string')
        expect(typeof user.last_name).toBe('string')

        // Reference: https://regex101.com/
        expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)

        expect(user.first_name.length).toBeGreaterThan(0)
        expect(user.last_name.length).toBeGreaterThan(0)
      })
    } catch (error: any) {
      console.error('C1 Test Error:', error.message)
      throw error
    }
  })

  test('C2 - Criar e atualizar usuário', async ({ request }) => {
    try {
      // 1. Faça uma requisição `POST` para o endpoint `/api/users` com um payload de criação.
      const startTimePost = Date.now()
      const response = await request.post(`${process.env.API_BASE_URL}/users`, {
        data: {
          name: 'User Test',
          job: 'QA Engineer',
        },
      })

      const endTimePost = Date.now()
      const responseTimePost = endTimePost - startTimePost
      expect(responseTimePost).toBeLessThanOrEqual(3000)

      const body = await response.json()

      // 2. Valide se a resposta contém o código de status 201
      expect(response.status()).toBe(201)

      // 3. E se usuário criado contém os dados corretos.
      expect(body).toHaveProperty('name')
      expect(body).toHaveProperty('job')
      expect(body).toHaveProperty('id')
      expect(body).toHaveProperty('createdAt')

      expect(typeof body.name).toBe('string')
      expect(typeof body.job).toBe('string')
      expect(typeof body.id).toBe('string')
      expect(typeof body.createdAt).toBe('string')
      expect(new Date(body.createdAt).getTime()).toBeGreaterThan(0)

      // ---------------------------------------------------------------- //

      // 0. Obtenho o ID do usuário recém criado
      const userId = body.id

      // 1. Faça uma requisição `PUT` para o endpoint `/api/users/2` e valide se o usuário foi atualizado corretamente.
      const startTimePut = Date.now()
      const putResponse = await request.put(`${process.env.API_BASE_URL}/users/${userId}`, {
        data: {
          name: 'User Test (Updated)',
          job: 'Senior QA Engineer',
        },
      })

      const endTimePut = Date.now()
      const responseTimePut = endTimePut - startTimePut

      expect(responseTimePut).toBeLessThanOrEqual(3000)

      const putBody = await putResponse.json()

      // 2. Comparo os dados antigos com os dados atuais, se houver diferença, dê como SUCESSO para o teste
      expect(putResponse.status()).toBe(200)
      expect(putBody).toHaveProperty('name')
      expect(putBody).toHaveProperty('job')
      expect(putBody.name).toBe('User Test (Updated)')
      expect(putBody.job).toBe('Senior QA Engineer')
    } catch (error: any) {
      console.error('C2 Test Error:', error.message)
      throw error
    }
  })

  test('C3 - Manipulação de falhas na API', async ({ request }) => {
    try {
      // // 1 - Faça uma requisição DELETE para um ID inválido e valide se a API retorna o código de status correto.
      const userId = 999
      const deleteResponse = await request.delete(`${process.env.API_BASE_URL}/users/${userId}`)

      // OBS.: a API retorna 204 para todos os casos, deveria retornar 404 para IDs inválidos
      // Reference: https://reqres.in/api-docs/#/default/delete_users__id_
      expect(deleteResponse.status()).not.toBe(404)
      expect(deleteResponse.status()).toBe(204)

      // 2. Falha no tempo limite na API
      try {
        await request.get(`${process.env.API_BASE_URL}/users?delay=1`, {
          timeout: 1, // forço a API me retornar em 1ms (cenário irreal, só para testes)
        })
        throw new Error('Expected timeout error')
      } catch (timeoutError: any) {
        expect(timeoutError.message).toContain('Request timed out after 1ms')
      }
    } catch (error: any) {
      console.error('C3 Test Error:', error.message)
      throw error
    }
  })
})
