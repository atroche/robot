define(['jquery'], function($) {
  var FontParserResult = function(slides) {
    this.slides = slides;
    this.resolution = 10;
    this.maxsize = 15;
    this.minsize = 5;
    this.width = 0;
    this.height = 300;
    this.passes = [];
    this.promise = new $.Deferred();
    this.totalPasses = 0;

    this.font = 100 + "px 'Georgia'";

    // initalise temporary canvas to measure the text widths
    var tmpCanvas = document.createElement('canvas');
    var tmpCtx = tmpCanvas.getContext('2d');
    tmpCtx.font = this.font;

    var pass = {};
    var currentText = null;
    var currentTextCtx = null;
    var textWidth = 0;

    var currentSlide = slides[0];
    var size = 0;

    textWidth = tmpCtx.measureText(currentSlide.text).width + 100;

    // if (textWidth > 1500) {
    //   tmpCtx.font = this.font = 72 + "pt 'Courier New'";
    //   textWidth = tmpCtx.measureText(currentSlide.text).width + 100;
    // }

    console.log(textWidth);

    currentText = document.createElement('canvas');
    currentText.width = textWidth;
    currentText.height = this.height;
    currentTextCtx = currentText.getContext('2d');
    currentTextCtx.fillStyle = 'white';
    currentTextCtx.font = this.font;
    currentTextCtx.fillText(currentSlide.text, 50, 200);
    currentSlide.wordPoints = [];

    for (size = this.maxsize; size >= this.minsize; size--) {
      this.passes.push({
        ctx: currentTextCtx,
        size: size,
        width: textWidth,
        slide: 0
      })
    }

    this.totalPasses = this.passes.length;
  }

  FontParserResult.prototype.getNextJob = function() {
    if (this.passes.length == 0) {
      this.promise.resolve(this);
      return null;
    }

    this.promise.notify([this.totalPasses - this.passes.length, this.totalPasses]);
    return this.passes.shift();
  }

  FontParserResult.prototype.addCoords = function(slide, coords) {
    if (!this.slides[slide].wordPoints) this.slides[slide].wordPoints = [];
    this.slides[slide].wordPoints = this.slides[slide].wordPoints.concat(coords);
  }

  return FontParserResult;
});