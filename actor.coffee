$ ->
  socket = io.connect('/')

  socket.emit 'identify',
    role: "actor"

  $('form').submit (e) ->
    e.preventDefault()

    msgBox = $('input#msg')
    msg = msgBox.val()

    socket.emit 'msg',
      msg: msg

    msgBox.val('')
    msgBox.focus()

    return false
