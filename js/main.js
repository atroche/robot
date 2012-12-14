require(['jquery', 'utils', 'fontparser'], function($, utils, fontparser) {
  $(document).ready(function() {

    $('#shareUrl').val(window.location);

    if (!utils.isCanvasSupported()) {
      window.location = '/sorry';
      return;
    }


    require(['fontparser', 'PlaybackView', 'Sprite', 'EditorView', 'jquery'], function( fontparser, PlaybackView, Sprite, EditorView, $) {



      Sprite.prototype.loadImages().then(function() {

        var playbackView = new PlaybackView('preview');
        playbackView.play('hello');

      });
    });
  });

});