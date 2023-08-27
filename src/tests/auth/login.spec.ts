/**
 * @jest-environment ./prisma/prisma-environment-jest
 */

import { describe, test } from "@jest/globals";
import supertest from 'supertest'
import { http } from '../../server'
import { prismaClient } from "../../database/prismaClient";
import createUser from "../helper/createUser";
import { faker } from "@faker-js/faker";

describe('Login', () => {
  const server = supertest(http);
  afterAll(done => {
    prismaClient.$disconnect().then(() => {
      done()
    })
  })

  test('login should work', async () => {
    const user = await createUser()
    const response = await server
      .post('/login')
      .send({
        email: user.email,
        password: user.password
      })
    expect(response.status).toBe(200)
    expect(typeof response.body.token).toBe('string')
  }); 

  test('login should not work when password is less than 3 caracters', async () => {
    const response = await server
      .post('/login')
      .send({
        email: faker.internet.email(),
        password: '12'
      })
    expect(response.status).toBe(403)
    expect(response.body.message).toBe('Senha deve ter no mínimo 3 caracteres')
  }); 


  test('login should not work when email is incorrect', async () => {
    const response = await server
      .post('/login')
      .send({
        email: 'emailErrado.com',
        password: faker.internet.password()
      })
    expect(response.status).toBe(403)
    expect(response.body.message).toBe('Email incorreto')
  }); 

  test('login should not work when user does not exist', async () => {
    const response = await server
      .post('/login')
      .send({
        email: faker.internet.email(),
        password: '123456789'
      })
    expect(response.status).toBe(403)
    expect(response.body.message).toBe('Credencias incorretas')
  }); 

  test('login should not work when password is incorrect', async () => {
    const user = await createUser()
    const response = await server
      .post('/login')
      .send({
        email: user.email,
        password: faker.internet.password()
      })
    expect(response.status).toBe(403)
    expect(response.body.message).toBe('Credencias incorretas')
  }); 
});