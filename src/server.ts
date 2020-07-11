import socket from 'socket.io'

import errorHandler from 'errorhandler'

import app from './app'

/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler())

/**
 * Start Express server.
 */
const server = app.listen(app.get('port'), () => {
  console.log('  App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'))
  console.log('  Press CTRL-C to stop\n')
})

const io = socket(server)

const activeUsers = new Set()

io.on('connection', function (socket: any) {
  console.log('Made socket connection')

  socket.on('new user', function (data: any) {
    socket.userId = data
    activeUsers.add(data)
    io.emit('new user', [...activeUsers])
  })

  socket.on('disconnect', () => {
    activeUsers.delete(socket.userId)
    io.emit('user disconnected', socket.userId)
  })
})

app.locals.io = io

export default server
