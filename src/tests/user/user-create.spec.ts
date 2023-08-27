/**
 * @jest-environment ./prisma/prisma-environment-jest
 */

import { describe, test } from "@jest/globals";
import supertest from 'supertest'
import { http } from '../../server'
import { prismaClient } from "../../database/prismaClient";
import { $Enums } from "@prisma/client";
import { faker } from '@faker-js/faker';

describe('User', () => {
  const server = supertest(http);
  afterAll(done => {
    prismaClient.$disconnect().then(() => {
      done()
    })
  })

  test.each([
    {
      userType: $Enums.USER_TYPE.COMMON
    },
    {
      userType: $Enums.USER_TYPE.SHOPKEEPER
    }
  ])('create a user should work', async ({ userType }) => {
    const userDataToCreate = {
      name: faker.person.firstName(),
      password: faker.internet.password(),
      cpf: faker.number.bigInt({ min: 11111111111, max:99999999999 }).toString(),
      email: faker.internet.email(),
      type: userType,
      balance: 100,
    }
    const response = await server.post('/user').send(userDataToCreate)
    expect(response.status).toBe(200)
    expect(response.body).toMatchObject(userDataToCreate)

    const createdUser = await prismaClient.user.findFirst({
      where: {
        id: response.body.id
      }
    })
    expect(createdUser).not.toBeNull()
    expect(createdUser).toMatchObject(userDataToCreate)
  });

  test('create a user with wrong email should fail', async () => {
    const userDataToCreate = {
      name: faker.person.firstName(),
      password: faker.internet.password(),
      cpf: faker.number.bigInt({ min: 11111111111, max:99999999999 }).toString(),
      email: 'emailErrado.com',
      type: $Enums.USER_TYPE.COMMON,
      balance: 100,
    }
    const response = await server.post('/user').send(userDataToCreate)
    expect(response.status).toBe(403)
    expect(response.body.message).toBe('Email incorreto')
  });

  test('create a user with wrong name should fail', async () => {
    const userDataToCreate = {
      name: 'a',
      password: faker.internet.password(),
      cpf: faker.number.bigInt({ min: 11111111111, max:99999999999 }).toString(),
      email: faker.internet.email(),
      type: $Enums.USER_TYPE.COMMON,
      balance: 100,
    }
    const response = await server.post('/user').send(userDataToCreate)
    expect(response.status).toBe(403)
    expect(response.body.message).toBe('Nome deve ter no mínimo 3 caracteres')
  });

  test('create a user with wrong password should fail', async () => {
    const userDataToCreate = {
      name: faker.person.firstName(),
      password: '1234',
      cpf: faker.number.bigInt({ min: 11111111111, max:99999999999 }).toString(),
      email: faker.internet.email(),
      type: $Enums.USER_TYPE.COMMON,
      balance: 100,
    }
    const response = await server.post('/user').send(userDataToCreate)
    expect(response.status).toBe(403)
    expect(response.body.message).toBe('Senha deve ter no mínimo 6 caracteres')
  });

  test('create a user with wrong user type should fail', async () => {
    const userDataToCreate = {
      name: faker.person.firstName(),
      password: faker.internet.password(),
      cpf: faker.number.bigInt({ min: 11111111111, max:99999999999 }).toString(),
      email: faker.internet.email(),
      type: 'TIPO_INCORRETO',
      balance: 100,
    }
    const response = await server.post('/user').send(userDataToCreate)
    expect(response.status).toBe(403)
    expect(response.body.message).toBe('Tipo incorreto de usuário')
  });

  test('create a user with wrong saldo should fail', async () => {
    const userDataToCreate = {
      name: faker.person.firstName(),
      password: faker.internet.password(),
      cpf: faker.number.bigInt({ min: 11111111111, max:99999999999 }).toString(),
      email: faker.internet.email(),
      type: $Enums.USER_TYPE.COMMON,
      balance: -1,
    }
    const response = await server.post('/user').send(userDataToCreate)
    expect(response.status).toBe(403)
    expect(response.body.message).toBe('Saldo incorreto')
  });
});