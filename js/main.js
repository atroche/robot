require(['jquery', 'utils', 'fontparser', 'socket.io'], function($, utils, fontparser, io) {
  $(document).ready(function() {

    $('#shareUrl').val(window.location);

    if (!utils.isCanvasSupported()) {
      window.location = '/sorry';
      return;
    }


    require(['fontparser', 'PlaybackView', 'Sprite', 'EditorView', 'jquery'], function( fontparser, PlaybackView, Sprite, EditorView, $) {



      Sprite.prototype.loadImages().then(function() {

        var playbackView = new PlaybackView();

        var socket = io.connect(':8080');

        socket.emit('identify', {
          role: "terminal"
        });

        socket.on('msg', function(data) {
          playbackView.play(data.msg);
        });

      });
    });
  });

});