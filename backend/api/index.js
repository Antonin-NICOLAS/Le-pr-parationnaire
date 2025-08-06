const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const middleware = require('i18next-http-middleware')
const i18n = require('../i18n/index')

//.env
require('dotenv').config()

//routes
const AuthRoutes = require('../routes/AuthRoutes')
const UserRoutes = require('../routes/UserRoutes')
const TwoFactorRoutes = require('../routes/TwoFactorRoutes')

//express app
const app = express()

//middleware
app.set('trust proxy', 1)
app.use(express.json({ limit: '50mb' }))
app.use(cookieParser())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false, limit: '50mb' }))

//cors
const corsOptions = {
  origin: process.env.FRONTEND_SERVER,
  credentials: true,
}

app.use(cors(corsOptions))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_SERVER)
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

app.use(middleware.handle(i18n))

//routes
app.get('/', (req, res) => {
  res.send("Voici l'API du préparationnaire")
})
app.use('/auth', AuthRoutes)
app.use('/auth/2fa', TwoFactorRoutes)
app.use('/user', UserRoutes)

//mongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('mongoDB connected')

    const port = process.env.PORT || 8000
    const host =
      process.env.NODE_ENV === 'production'
        ? 'step-ify.vercel.app'
        : 'localhost'

    app.listen(port, function () {
      console.log('Server Has Started!')
      console.log(`Server is running at http://${host}:${port}`)
    })
  })
  .catch((err) => {
    console.log('failed to connect', err)
    process.exit(1)
  })
