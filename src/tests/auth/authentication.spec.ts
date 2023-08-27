/**
 * @jest-environment ./prisma/prisma-environment-jest
 */

import { describe, test } from "@jest/globals";
import supertest from 'supertest'
import { http } from '../../server'
import { prismaClient } from "../../database/prismaClient";
import generateUserToken from "../helper/generateUserToken";
import { $Enums } from "@prisma/client";

describe('Authentication', () => {
  const server = supertest(http);
  afterAll(done => {
    prismaClient.$disconnect().then(() => {
      done()
    })
  })

  test('without token should not work', async () => {
    const transferDataToCreate = {
      recieverId: 1,
      value: 10
    }
    const response = await server.post('/transfer').send(transferDataToCreate)

    expect(response.status).toBe(401)
    expect(response.body.message).toBe('Token necessário')
  }); 

  test('with a valid incorrect token should not work', async () => {
    const transferDataToCreate = {
      recieverId: 1,
      value: 10
    }
    const token = await generateUserToken({
      id: 0,
      name: 'name',
      type: $Enums.USER_TYPE.COMMON
    })
    const response = await server
      .post('/transfer')
      .send(transferDataToCreate)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(403)
    expect(response.body.message).toBe('Token inválido')
  }); 

  test('with a invalid token should not work', async () => {
    const transferDataToCreate = {
      recieverId: 1,
      value: 10
    }

    const response = await server
      .post('/transfer')
      .send(transferDataToCreate)
      .set('Authorization', `Bearer invalidtoken`)

    expect(response.status).toBe(403)
    expect(response.body.message).toBe('Token inválido')
  }); 
});