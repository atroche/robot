define(['jquery', 'Sprite', 'Animation', 'SpriteManager', 'AnimationWatcher'], function($, Sprite, Animation, SpriteManager, AnimationWatcher) {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');

  canvas.width = $(window).width();
  canvas.height = $(window).height();

  var PlaybackView = function(mode) {
    this.clickHandler = null;
    var self = this;
    this.spriteManager = new SpriteManager();
    this.originX = Math.round(canvas.width / 2);
    this.originY = Math.round(canvas.height / 2);
    this.spriteManager.setOrigin(this.originX, this.originY);
    this.currentSlide = 0;
    this.timer = null;
    this.mode = mode;
    this.oldMouseX = null;
    this.oldMouseY = null;

    $('canvas,#clickPrompt').click(function(e) {
      self.handleClick(e);
      e.preventDefault();
    });

    $(window).resize(function(e) {
      canvas.width = $(window).width();
      canvas.height = $(window).height();
      self.originX = Math.round(canvas.width / 2);
      self.originY = Math.round(canvas.height / 2);
      self.spriteManager.setOrigin(self.originX, self.originY);
    });

    if (mode != 'preview') {
      $('.playbackOptions').show();
    }
  }

  PlaybackView.prototype.stop = function() {
    $('canvas').unbind('click');
    $('canvas').unbind('mousemove');
    $(canvas).removeClass('playback');
    $(window).unbind('resize');
    clearTimeout(this.timer);
    hidePrompt();
  }

  PlaybackView.prototype.play = function(slides) {
    this.currentSlide = 0;
    this.slides = slides;
    var slide = slides[this.currentSlide];

    $(canvas).addClass('playback');

    this.createSpritesForCoords(slide.wordPoints);

    this.clickHandler = clickHandlers.formLetter;
    showPrompt(config.translations.promptStart);
    if (this.timer === null) this.tick();
  }

  PlaybackView.prototype.createSpritesForCoords = function(coords) {
    var item = [], sprite = null;
    for (var index in coords) {
      item = coords[index];
      sprite = new Sprite(rand(this.originX * 2) - this.originX, rand(this.originY * 2) - this.originY, item[2]);
      sprite.data.targetX = item[0];
      sprite.data.targetY = item[1];
      sprite.data.targetSize = item[2];
      sprite.opacity = 0;
      sprite.addAnimation(new Animation('moveRandomlyX', {start: sprite.x, max: this.originX, period: rand(200) + 100} ));
      sprite.addAnimation(new Animation('moveRandomlyY', {start: sprite.y, max: this.originY, period: rand(200) + 100} ));
      sprite.addAnimation(new Animation('fadeIn', {max: 0.5}));
      this.spriteManager.addSprite(sprite);
      this.spriteManager.addSpriteToTag(sprite, 'message');
    }
  }

  PlaybackView.prototype.tick = function() {
    var self = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.spriteManager.updateAndRender(ctx);
    this.timer = setTimeout(function() {
      self.tick()
      }, 34);
  }

  PlaybackView.prototype.handleClick = function(e) {
    var self=this, sprite = {}, index = 0;

    if (this.clickHandler) {
      var handler = this.clickHandler;
      this.clickHandler = null;
      hidePrompt();
      handler.call(this, e);
    }
  }

  PlaybackView.prototype.slideFinished = function() {
    var self = this, sprite = {};

    var sprites = this.spriteManager.getSpritesByTag('message');
    for (var index in sprites) {
      sprite = sprites[index];
      this.spriteManager.addSpriteToTag(sprite, 'inPosition');
      sprite.addAnimation(new Animation('flash', {
        target: sprite.data.targetSize
        }));
      if (index % 3 == 0) {
        sprite = new Sprite(sprites[index].x, sprites[index].y, rand(15) );
        sprite.opacity = 1;
        sprite.addAnimation(new Animation('explode'));
        this.spriteManager.addSprite(sprite);
        this.spriteManager.removeSpriteOnAnimationsFinished(sprite);
      }
    }
    showPrompt();
  }

  var clickHandlers = {};
  clickHandlers.formLetter = function() {
    var self = this;
    var sprites = this.spriteManager.getSpritesByTag('message');
    var animationWatcher = new AnimationWatcher;
    for (var index in sprites) {
      sprite = sprites[index];
      sprite.finishAnimations();
      sprite.signals.animationsFinished.addOnce(function(s) {
        return function() {
          s.addAnimation(new Animation('moveTo', {
            x: s.data.targetX,
            y: s.data.targetY,
            period: rand(30) + 50
          }, animationWatcher));
          s.opacity = 1;

        }
      }(sprite));
    }
    animationWatcher.signals.finished.add(function() {
      self.slideFinished.call(self);
    });
  }

  clickHandlers.explode = function() {
    var sprite = null;
    var self = this;
    var sprites = this.spriteManager.getSpritesByTag('message');
    for (var index in sprites) {
      sprite = sprites[index];
      sprite.addAnimation(new Animation('explode'));
      this.spriteManager.removeSpriteOnAnimationsFinished(sprite);
    }
  }

  clickHandlers.replay = function() {
    this.play(this.slides);
  }



  function rand(max) {
    return Math.floor(Math.random() * max ) + 1;
  }

  function showPrompt(text) {
    var $clickPrompt = $('#clickPrompt');
    text = text || config.translations.promptClick;
    $clickPrompt.text(text).addClass('show');
    $clickPrompt.css('left', Math.round($(window).width() / 2) - Math.round($clickPrompt.width() / 2));
  }

  function hidePrompt() {
    $('#clickPrompt').removeClass('show');
  }


  return PlaybackView;
});