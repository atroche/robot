stat = require("node-static")
http = require("http")
file = new (stat.Server)()

app = http.createServer((req, res) ->
  file.serve req, res
)

io = require("socket.io").listen(app)

app.listen 8080

terminal = null
actor = null

sendMessage = (msg, socket) ->
  socket.emit "msg",
    msg: msg


io.sockets.on "connection", (socket) ->

  console.log "new connection"

  socket.on "identify", (data) ->

    console.log data

    if data.role == "actor"
      actor = socket

      socket.on "msg", (data) ->
        sendMessage(data.msg, terminal)

    else if data.role == "terminal"
      terminal = socket


