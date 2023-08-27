/**
 * @jest-environment ./prisma/prisma-environment-jest
 */

import { describe, test } from "@jest/globals";
import supertest from 'supertest'
import { http } from '../../server'
import { prismaClient } from "../../database/prismaClient";
import createUser from "../helper/createUser";
import generateUserToken from "../helper/generateUserToken";
import { $Enums } from "@prisma/client";

describe('Transfer', () => {
  const server = supertest(http);
  afterAll(done => {
    prismaClient.$disconnect().then(() => {
      done()
    })
  })

  test('create transfer should work', async () => {
    const sender = await createUser()
    const reciever = await createUser()

    const token = await generateUserToken(sender)

    const transferDataToCreate = {
      recieverId: reciever.id,
      value: 10
    }
    const response = await server
      .post('/transfer')
      .send(transferDataToCreate)
      .set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Tranferencia concluída')
  }); 

  test('create transfer with wrong value should not work', async () => {
    const sender = await createUser()
    const reciever = await createUser()

    const token = await generateUserToken(sender)

    const transferDataToCreate = {
      recieverId: reciever.id,
      value: -1
    }
    const response = await server
      .post('/transfer')
      .send(transferDataToCreate)
      .set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(403)
    expect(response.body.message).toBe('Valor incorreto')
  }); 

  test('create transfer with wrong sender should not work', async () => {
    const sender = await createUser()
    const token = await generateUserToken(sender)

    const transferDataToCreate = {
      recieverId: 99999,
      value: 10
    }
    const response = await server
      .post('/transfer')
      .send(transferDataToCreate)
      .set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(404)
    expect(response.body.message).toBe('Recebedor não encontrado')
  }); 

  test('create transfer with no enough balance should not work', async () => {
    const sender = await createUser({
      balance: 5,
    })
    const reciever = await createUser()
    const token = await generateUserToken(sender)

    const transferDataToCreate = {
      recieverId: reciever.id,
      value: 10
    }
    const response = await server
      .post('/transfer')
      .send(transferDataToCreate)
      .set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(403)
    expect(response.body.message).toBe('Sem saldo suficiente')
  }); 

  test('create transfer with SHOPKEEPER should not work', async () => {
    const sender = await createUser({
      type: $Enums.USER_TYPE.SHOPKEEPER
    })
    const reciever = await createUser()
    const token = await generateUserToken(sender)

    const transferDataToCreate = {
      recieverId: reciever.id,
      value: 10
    }
    const response = await server
      .post('/transfer')
      .send(transferDataToCreate)
      .set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(401)
    expect(response.body.message).toBe('Sem permissão')
  }); 
});