import { Router } from 'express'
import TransferController from '../controller/TransferController'

const transferRoutes = Router()

const transferController = new TransferController()

transferRoutes.post('/', transferController.create)

export default transferRoutes

