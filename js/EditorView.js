define(['jquery', 'PlaybackView', 'fontparser', 'Sprite'], function($, PlaybackView, fontparser, Sprite) {
  var t = null;
  var canvas = document.getElementById('canvas');
  canvas.width = $(window).width();
  canvas.height = $(window).height();

  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.font = "250px 'Times New Roman'";

  var width = canvas.width;
  var height = canvas.height;

  var EditorView = function() {
    var self = this;
    this.previousX = null;
    this.previousY = null;
    $('#editorToolbar').fadeIn();
    $('#editorToolbar').fadeIn();
    $('#frameText').keyup(function(e) {self.handleKeyup.call(self, e);});
    $('#previewButton').click(function(e) {self.runPreview.call(self);e.preventDefault();});

    $('#previousSlideButton').click(function(e) {self.previousSlide.call(self);e.preventDefault();});

    $('#stopPlaybackButton').click(function(e) {self.stopPreview.call(self);e.preventDefault();});

    $(document).keydown(function(e) {$('#frameText').focus()});
    this.currentSlide = 0;
    this.slides = [];
    this.addSlide();

    this.originX = Math.round(canvas.width / 2);
    this.originY = Math.round(canvas.height / 2);
    this.playbackView = null;

    $(canvas).addClass('editing');
  }

  EditorView.prototype.addSlide = function() {
    var slide = {
      text: [],
      wordPoints: []
    }
    this.currentSlide = this.slides.push(slide) - 1;
    this.drawCurrentSlide();
  }

  EditorView.prototype.drawCurrentSlide = function() {
    var slide = this.slides[this.currentSlide];

    ctx.fillStyle = 'white';
    ctx.font = "250px 'Times New Roman'";
    $('#frameText').val(slide.text);
    $('#currentSlide').text((this.currentSlide + 1) + ' of ' + this.slides.length);
    this.renderText(slide.text);
  }

  EditorView.prototype.handleKeyup = function(e) {
    this.slides[this.currentSlide].text = $(e.target).val();
    this.drawCurrentSlide();
  }

  EditorView.prototype.renderText = function(word) {
    ctx.fillStyle = 'white';
    ctx.font = "250px 'Times New Roman'";

    var textWidth = ctx.measureText(word).width;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillText(word, Math.round(width / 2) - Math.round(textWidth / 2), Math.round(height / 2));
  }

  EditorView.prototype.runPreview = function() {
      var parsingComplete = fontparser.start(this.slides);

      var self = this;
      $(canvas).removeClass('editing');

      $('.editorControl').hide();
      $('.playbackControl').show();
      $(canvas).unbind();

      parsingComplete.then(function() {
        self.removeEmptySlides();
        var playbackView = new PlaybackView('preview');
        playbackView.play(self.slides);
        self.playbackView = playbackView;
      });
  }

  EditorView.prototype.removeEmptySlides = function() {
    var remainingSlides = [];
    for (var index in this.slides) {
      if (this.slides[index].text.length > 0) {
        remainingSlides.push(this.slides[index]);
      }
    }

    if (this.slides.length > remainingSlides.length) {
      alert('Removed ' + (this.slides.length - remainingSlides.length) + ' empty slide(s).');
    }

    this.slides = remainingSlides;

    // double check we have some left
    if (this.slides.length == 0) {
      this.addSlide();
    }
    else {
      this.currentSlide = this.slides.length - 1;
      this.drawCurrentSlide();
    }
  }

  EditorView.prototype.stopPreview = function() {
    this.playbackView.stop();
    $('.editorControl').show();
    $('.playbackControl').hide();
    this.playbackView = null;
    var self = this;
    $(canvas).addClass('editing');

    this.drawCurrentSlide();
  }

  function rand(max) {
    return Math.floor(Math.random() * max ) + 1;
  }


  return EditorView;
});