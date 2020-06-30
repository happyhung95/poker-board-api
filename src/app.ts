import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
import lusca from 'lusca'
import mongoose from 'mongoose'
import bluebird from 'bluebird'

import { MONGODB_URI } from './util/secrets'

import gameRouter from './routers/v1'

import apiErrorHandler from './middlewares/apiErrorHandler'
import apiContentType from './middlewares/apiContentType'

const app = express()
const mongoUrl = MONGODB_URI

mongoose.Promise = bluebird
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
  })
  .catch((err: Error) => {
    console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err)
    process.exit(1)
  })

// Express configuration
app.set('port', process.env.PORT || 3000)

// Use common 3rd-party middlewares
app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(lusca.xframe('SAMEORIGIN'))
app.use(lusca.xssProtection(true))

app.use(apiContentType)

// add CORS header
app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['*'])
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.append('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

// Use router
app.use('/api/v1/', gameRouter)

// Custom API error handler
app.use(apiErrorHandler)

export default app
