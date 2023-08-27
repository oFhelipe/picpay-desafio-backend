import { NextFunction, Request, Response } from "express"
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { ForbiddenError, UnauthorizedError } from "../helper/api_errors/ApiError"
import { prismaClient } from "../database/prismaClient"


class AuthController {
  public async login(request: Request, response: Response, next: NextFunction) {
    const userSchema = z.object({
      email: z.string().email('Email incorreto'),
      password: z.string().min(6, 'Senha deve ter no mínimo 3 caracteres')
    })

    const userSchemaResult = await userSchema.safeParse(request.body)

    if(!userSchemaResult.success) {
      return next(new ForbiddenError(userSchemaResult.error.errors[0].message))
    }

    const { email, password } = userSchemaResult.data

    const user =  await prismaClient.user.findFirst({
      where: {
        email,
      }
    })

    if(!user) {
      return next(new ForbiddenError('Credencias incorretas'))
    }

    if (user.password !== password) {
      return next(new ForbiddenError('Credencias incorretas'))
    }
    
    const secret = 'privateKey'
    const token = jwt.sign({
      id: user.id,
      name: user.name,
      type: user.type,
    }, secret);

    return response.send({
      token
    })
  }

  public async verify(request: Request, response: Response, next: NextFunction) {
    const { authorization } = request.headers
    if(!authorization) {
      return next(new UnauthorizedError('Token necessário'))
    }

    const [, token] = authorization.split(' ')

    const secret = 'privateKey'

    try {
      const decoded = jwt.verify(token, secret) as any

      const user = await prismaClient.user.findFirst({
        where: {
          id: decoded.id,
        }
      })

      if(!user) {
        return next(new ForbiddenError('Token inválido'))
      }

      request.user = user

      return next();
    } catch (error) {
      return next(new ForbiddenError('Token inválido'))
    }
  }
}

export default AuthController
