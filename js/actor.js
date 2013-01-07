// Generated by CoffeeScript 1.3.3
(function() {

  $(function() {
    var socket;
    socket = io.connect('/');
    socket.emit('identify', {
      role: "actor"
    });
    return $('form').submit(function(e) {
      var msg, msgBox;
      e.preventDefault();
      msgBox = $('input#msg');
      msg = msgBox.val();
      socket.emit('msg', {
        msg: msg
      });
      msgBox.val('');
      msgBox.focus();
      return false;
    });
  });

}).call(this);
