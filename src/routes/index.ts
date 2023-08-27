import { Router, Response } from 'express'

import userRoutes from './user'
import authRoutes from './auth'
import transferRoutes from './transfer'
import AuthController from '../controller/AuthController'

const routes = Router()

const authController  = new AuthController()


routes.use('/', authRoutes)

routes.use('/user', userRoutes)
routes.use('/transfer', authController.verify, transferRoutes)

routes.get('/ping', (_, response: Response) => {
  response.send('pong')
})

export default routes

