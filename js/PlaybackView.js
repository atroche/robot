define(['jquery', 'Sprite', 'Animation', 'SpriteManager', 'AnimationWatcher', 'fontparser', 'speakClient'], function($, Sprite, Animation, SpriteManager, AnimationWatcher, fontparser, speakClient) {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');

  canvas.width = $(window).width();
  canvas.height = $(window).height();

  var PlaybackView = function() {
    this.clickHandler = null;
    var self = this;
    this.spriteManager = new SpriteManager();
    this.originX = Math.round(canvas.width / 2);
    this.originY = Math.round(canvas.height / 2);
    this.spriteManager.setOrigin(this.originX, this.originY);
    this.currentSlide = 0;
    this.timer = null;

    this.oldMouseX = null;
    this.oldMouseY = null;

    $('canvas').click(function(e) {
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

    $(canvas).addClass('playback');

    this.createBGSprites();

    this.tick();
  }

  PlaybackView.prototype.createBGSprites = function() {
    for(var i=0;i<200;i++) {
      sprite = new Sprite(rand(this.originX * 2) - this.originX, rand(this.originY * 2) - this.originY, 5 + rand(5));
      sprite.opacity = 1;
      sprite.addAnimation(new Animation('moveRandomlyX', {start: sprite.x, max: this.originX, period: rand(200) + 100} ));
      sprite.addAnimation(new Animation('moveRandomlyY', {start: sprite.y, max: this.originY, period: rand(200) + 100} ));
      this.spriteManager.addSprite(sprite);
      this.spriteManager.addSpriteToTag(sprite, 'bg');
    }
  }

  PlaybackView.prototype.stop = function() {
    $('canvas').unbind('click');
    $('canvas').unbind('mousemove');
    $(canvas).removeClass('playback');
    $(window).unbind('resize');
    clearTimeout(this.timer);

  }

  PlaybackView.prototype.play = function(text) {
    this.text = text;

    var slides = [{
      text: text,
      wordPoints: []
    }];

    // Adds Wordpoints to slides
    var parsingComplete = fontparser.start(slides);

    var self = this;
    parsingComplete.then(function() {
      self.createSpritesForCoords(slides[0].wordPoints);
      clickHandlers.formLetter.apply(self);
      if (self.timer === null) self.tick();
    });
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
      // sprite.addAnimation(new Animation('moveRandomlyX', {start: sprite.x, max: this.originX, period: rand(200) + 100} ));
      // sprite.addAnimation(new Animation('moveRandomlyY', {start: sprite.y, max: this.originY, period: rand(200) + 100} ));
      sprite.addAnimation(new Animation('fadeIn', {max: 0.5, period: 1}));
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

      handler.call(this, e);
    }
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
            period: 35
          }, animationWatcher));
          s.opacity = 1;

        }
      }(sprite));
    }

    animationWatcher.signals.finished.add(function() {

      setTimeout(function(){
        speak(self.text);
      }, 500);

      var moveRandomly = function(sprite) {
        return function(){
          sprite.addAnimation(new Animation('moveRandomlyX', {start: sprite.x, max: self.originX, period: rand(200) + 100} ));
          sprite.addAnimation(new Animation('moveRandomlyY', {start: sprite.y, max: self.originY, period: rand(200) + 100} ));
        }
      }

      var fadeOutAndDie = function(sprite) {
        return function(){
          sprite.addAnimation(new Animation('fadeOut'));
          self.spriteManager.removeSpriteOnAnimationsFinished(sprite);
        }
      }

      for (var index in sprites) {
        sprite = sprites[index];

        self.spriteManager.removeSpriteFromTag(sprite, 'message');
        setTimeout(moveRandomly(sprite), 2500);
        setTimeout(fadeOutAndDie(sprite), 5000 + rand(12000));
      }
    });
  }

  clickHandlers.replay = function() {
    this.play(this.slides);
  }



  function rand(max) {
    return Math.floor(Math.random() * max ) + 1;
  }


  return PlaybackView;
});