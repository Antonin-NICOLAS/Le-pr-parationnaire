import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { handle } from 'i18next-http-middleware'
import i18nInit from '../i18n/index.js'
import dotenv from 'dotenv'

dotenv.config()

import AuthRoutes from '../routes/AuthRoutes.js'
import UserRoutes from '../routes/UserRoutes.js'
import TwoFactorRoutes from '../routes/TwoFactorRoutes.js'

const app = express()

app.set('trust proxy', 1)
app.use(express.json({ limit: '50mb' }))
app.use(cookieParser())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false, limit: '50mb' }))

const corsOptions = {
  origin: process.env.FRONTEND_SERVER,
  credentials: true,
}
app.use(cors(corsOptions))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_SERVER || '')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  )
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  )
  next()
})

// Configuration du middleware i18n
const i18n = await i18nInit
app.use(handle(i18n))

app.get('/', (req, res) => {
  res.send("Voici l'API du préparationnaire")
})

app.use('/auth', AuthRoutes)
app.use('/auth/2fa', TwoFactorRoutes)
app.use('/user', UserRoutes)

mongoose
  .connect(process.env.MONGO_URI || '')
  .then(() => {
    console.log('mongoDB connected')

    const port = process.env.PORT || 8000
    const host =
      process.env.NODE_ENV === 'production'
        ? 'step-ify.vercel.app'
        : 'localhost'

    app.listen(port, () => {
      console.log('Server Has Started!')
      console.log(`Server is running at http://${host}:${port}`)
    })
  })
  .catch((err) => {
    console.error('failed to connect', err)
    process.exit(1)
  })

export default app
