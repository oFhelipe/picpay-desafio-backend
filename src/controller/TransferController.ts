import { $Enums } from "@prisma/client"
import { NextFunction, Request, Response } from "express"
import { z } from 'zod'
import { ForbiddenError, NotFoundError, UnauthorizedError } from "../helper/api_errors/ApiError"
import { prismaClient } from "../database/prismaClient"

class TransferController {

  public async create(request: Request, response: Response, next: NextFunction) {
    return await prismaClient.$transaction(async (trx) => {
      const { recieverId, value } = request.body

      const userSchema = z.object({
        value: z.number().gte(0, 'Valor incorreto'),
        recieverId: z.number().gte(0, 'Recebedor incorreto')
      })
  
      const userSchemaResult = await userSchema.safeParse(request.body)
  
      if(!userSchemaResult.success) {
        return next(new ForbiddenError(userSchemaResult.error.errors[0].message))
      }

      const user = request.user

      if(user.type === $Enums.USER_TYPE.SHOPKEEPER) {
        return next(new UnauthorizedError('Sem permissão'))
      }

      if(user.balance <= value) {
        return next(new ForbiddenError('Sem saldo suficiente'))
      }

      const reciever = await trx.user.findFirst({
        where: {
          id: {
            equals: recieverId,
          },
        }
      })

      if(!reciever) {
        return next(new NotFoundError('Recebedor não encontrado'))
      }

      const transferAuthResponse = await fetch("https://run.mocky.io/v3/8fafdd68-a090-496f-8c9a-3442cf30dae6")
      const authResult = await transferAuthResponse.json()

      if(authResult.message !== 'Autorizado') {
        return next(new ForbiddenError('Tranferencia não autorizada'))
      }

      await trx.user.update({
        data: {
          balance: {
            decrement: value,
          }
        }, where: {
          id: user.id,
        }
      })

      await trx.user.update({
        data: {
          balance: {
            increment: value,
          }
        }, where: {
          id: reciever.id,
        }
      })

      await trx.transfer.create({
        data: {
          value,
          recieverId: reciever.id,
          senderId: user.id
        }
      })

      return response.json({
        message: 'Tranferencia concluída'
      })
    })
  }

}

export default TransferController
