require(['jquery', 'utils'], function($, utils) {
  $(document).ready(function() {
    
    $('#shareUrl').val(window.location);
    
    if (!utils.isCanvasSupported()) {
      window.location = '/sorry';
      return;
    }
    
    
    require(['fontparser', 'PlaybackView', 'Sprite', 'EditorView', 'jquery'], function( fontparser, PlaybackView, Sprite, EditorView, $) {
    

    
      Sprite.prototype.loadImages().then(function() {

        var path = window.location.pathname.substr(1), view = null;
        if (path != '') {
            var view = new PlaybackView();
            view.play(particleData);
        }
        else {
          view = new EditorView();
        }
        
      });
    });   
  });
  
});