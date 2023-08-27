import { http } from './server'

const port = process.env.PORT ?? 3333

http.listen(port , () => {
    console.log(`Api iniciada na porta ${port}`)
})