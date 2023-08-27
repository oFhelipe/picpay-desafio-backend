import { $Enums } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { z } from 'zod'
import { ForbiddenError } from "../helper/api_errors/ApiError";
import { prismaClient } from "../database/prismaClient";

class UserController {
  public async create(request: Request, response: Response, next:NextFunction) {
    const userSchema = z.object({
      email: z.string().email('Email incorreto'),
      name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
      password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
      cpf: z.string().min(11, 'Cpf deve ter no mínimo 11 caracteres'),
      type: z.nativeEnum($Enums.USER_TYPE, { errorMap: () => { return { message: 'Tipo incorreto de usuário'}} }),
      balance: z.number().gte(0, 'Saldo incorreto')
    })

    const userSchemaResult = userSchema.safeParse(request.body)

    if(!userSchemaResult.success) {
      return next(new ForbiddenError(userSchemaResult.error.errors[0].message))
    }

    const userData = userSchemaResult.data

    const user = await prismaClient.user.create({
      data: userData,
    })
    return response.json(user)
  }
}

export default UserController