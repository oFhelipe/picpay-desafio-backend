import express from 'express'
import routes from './routes'
import { errorMiddleware } from './middlewares/error'
import { createServer } from "http"


const api = express()
const port = process.env.PORT ?? 3333

api.use(express.json())
api.use(routes)
api.use(errorMiddleware)

const http = createServer(api)

export { http }