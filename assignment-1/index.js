const http = require('http')
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')

const dishRouter = require('./routes/dishRouter')
const promoRouter = require('./routes/promoRouter')
const leaderRouter = require('./routes/leaderRouter')

const hostname = 'localhost'
const port = 3000

const app = express()
app.use(morgan('dev'))
app.use(bodyParser.json())

app.use('/dishes', dishRouter)
app.use('/promotions', promoRouter)
app.use('/leaders', leaderRouter)

app.use(express.static(__dirname + '/public'))

const server = http.createServer(app)

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})
