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

    $('canvas').mousemove(function(e) {
      self.handleMove(e);
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

  PlaybackView.prototype.nextSlide = function() {
    this.currentSlide++;
    var self = this;
    var animationWatcher = null;
    var index = 0;

    if (this.currentSlide == this.slides.length) {
      // it's all over
      var sprites = this.spriteManager.getSpritesByTag('message');
      var animationWatcher = new AnimationWatcher();
      for (index in sprites) {
        sprite = sprites[index];
        sprite.clearAnimations();
        sprite.addAnimation(new Animation('explode', {}, animationWatcher));
        this.spriteManager.removeSpriteFromTag(sprite, 'inPosition');
        this.spriteManager.removeSpriteOnAnimationsFinished(sprite);
      }

      animationWatcher.signals.finished.add(function() {
        self.clickHandler = clickHandlers.replay;
        showPrompt(config.translations.promptReplay);
      });

      if (this.mode !== 'preview') {
        showShare();
      }

     return;
    }

    var slide = this.slides[this.currentSlide];
    var sprite = {};

    animationWatcher = new AnimationWatcher;

    var spritesToChangeObj = this.spriteManager.getSpritesByTag('message');
    var spritesToChange = [];
    for (index in spritesToChangeObj) {
      spritesToChange.push(spritesToChangeObj[index]);
    }

    this.createOrMoveSprites(spritesToChange, slide.wordPoints, animationWatcher);

    animationWatcher.signals.finished.add(function() {
      self.slideFinished.call(self);
    });

    // any leftover sprites need to be destroyed
    for (index = 0; index < spritesToChange.length; index++) {
      sprite = spritesToChange[index];
      sprite.clearAnimations();
      sprite.addAnimation(new Animation('explode'));
      this.spriteManager.removeSpriteOnAnimationsFinished(sprite);
      this.spriteManager.removeSpriteFromTag(sprite, 'inPosition');
      this.spriteManager.removeSpriteFromTag(sprite, 'message');
    }
  }

  PlaybackView.prototype.createOrMoveSprites = function(spritesToChange, coords, animationWatcher) {
    var numPoints = coords.length, item = [], sprite = {};
    for (var index = 0; index < numPoints; index ++ ) {
      item = coords[index];
      sprite = spritesToChange.shift();
      if (sprite === undefined) {
        sprite = new Sprite(item[0] + rand(200) - 100, item[1] + rand(200) - 100, item[2]);
        this.spriteManager.addSprite(sprite);
        sprite.opacity = 0;
        sprite.size = item[2];
        sprite.addAnimation(new Animation('fadeIn', {max: 1, period: 30}));
      }
      else {
        sprite.clearAnimations();
      }
      sprite.data.targetX = item[0];
      sprite.data.targetY = item[1];
      sprite.data.targetSize = item[2];
      sprite.size = item[2];
      sprite.addAnimation(new Animation('explodeTo', {x1: sprite.x + rand(200) - 100, y1: sprite.y + rand(200) -100, period: 30, x2: sprite.data.targetX, y2: sprite.data.targetY}, animationWatcher));
      this.spriteManager.addSpriteToTag(sprite, 'message');
      this.spriteManager.removeSpriteFromTag(sprite, 'inPosition');
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

    hideShare();

    if (this.clickHandler) {
      var handler = this.clickHandler;
      this.clickHandler = null;
      hidePrompt();
      handler.call(this, e);
    }

    for (index = 0; index < 25; index++) {
      sprite = new Sprite;
      sprite.x = e.pageX - this.originX;
      sprite.y = e.pageY - this.originY;
      sprite.size = rand(15);
      sprite.addAnimation(new Animation('explode'));
      this.spriteManager.addSprite(sprite);
      this.spriteManager.removeSpriteOnAnimationsFinished(sprite);

    }
  }

  PlaybackView.prototype.handleMove = function(e) {
    var self=this;
    var sprite = new Sprite(e.pageX - this.originX, e.pageY - this.originY, rand(15), ['mousemove']);
    sprite.addAnimation(new Animation('fadeOut'));
    this.spriteManager.addSprite(sprite);
    this.spriteManager.removeSpriteOnAnimationsFinished(sprite);

    var x = e.pageX - this.originX -64, y = e.pageY - this.originY - 64, x2 = x + 128, y2 = y + 128 ;

    if (this.oldMouseX === null) {
      this.oldMouseX = x;
      this.oldMouseY = y;
    }

    var sprites = this.spriteManager.getSpritesByTag('inPosition');
    var s = {};
    var dx = 0,dy = 0, x1 = 0, y1 = 0, deltaX = x - this.oldMouseX, deltaY = y - this.oldMouseY, distance = 0, scale = 0, size = 0, averageV = 0;
    for (var index in sprites) {
      sprite = sprites[index];

      distance = Math.sqrt(Math.pow(x - sprite.x + 64, 2) + Math.pow(y - sprite.y + 64, 2));
      if (distance > 128) continue;
      scale = 1 - (distance / 128);

      if (sprite.x > x && sprite.y > y && sprite.x < x2 && sprite.y < y2) {
        dx = sprite.data.targetX;
        dy = sprite.data.targetY;

        size = Math.ceil(15 * scale);
        if (size < sprite.size) size = sprite.size;
        averageV = Math.ceil(((deltaX + deltaY) / 2) * scale);
        x1 = sprite.x + rand(averageV) - rand(averageV);
        y1 = sprite.y + rand(averageV) - rand(averageV);
        sprite.addAnimation(new Animation('explodeTo', {x1: x1, y1: y1, x2: dx, y2: dy, period: 10}));
        sprite.addAnimation(new Animation('flash', {start: size, target: sprite.data.targetSize, period: 10}));

        if (distance < 5) {
          s = new Sprite(sprite.x, sprite.y, rand(10) + 5);
          s.addAnimation(new Animation('explode'));
          this.spriteManager.addSprite(s);
          this.spriteManager.removeSpriteOnAnimationsFinished(s);
        }

      }
    }
    this.oldMouseX = x;
    this.oldMouseY = y;
  }

  PlaybackView.prototype.slideFinished = function() {
    var self = this, sprite = {};
    this.clickHandler = clickHandlers.nextSlide;
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

  clickHandlers.nextSlide = function() {
    this.nextSlide();
  }

  clickHandlers.replay = function() {
    this.play(this.slides);
  }

  function showShare() {
    var $share = $('#share');
    $share.css('top', Math.round($(window).height() / 2) - Math.round($share.height() / 2));
    $share.css('left', Math.round($(window).width() / 2) - Math.round($share.width() / 2));
    $share.fadeIn('slow');
  }

  function hideShare() {
    $('#share').fadeOut('slow');
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