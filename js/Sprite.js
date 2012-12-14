define(['signals', 'jquery'], function(signals, $) {
  
  var img = [];
  var scaledImg = [];
  
  var Sprite = function(x, y, size) {
    this.x = x;
    this.y = y;
    this.data = {};
    this.size = size;
    this.img = scaledImg[rand(3)];
    this.opacity = 1;
    this.animations = {};
    this.signals = {
      animationsFinished: new signals.Signal()
    }
  }
  
  Sprite.prototype.render = function(ctx, originX, originY) {
    ctx.save();
    var size = this.size;
    size -= rand(3);
    if (size < 2) size = 2;
    ctx.globalAlpha = this.opacity;
    var sizeOffset = size;
    ctx.drawImage(this.img[size], originX + this.x - sizeOffset,  originY + this.y - sizeOffset);
    ctx.restore();
  }
  
  Sprite.prototype.tick = function() {
    for (var index in this.animations) {
      this.animations[index].tick(this);
    }
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    
    if (rand(10) == 1) {
      this.img = scaledImg[rand(3)];
    }
    
    return this;
  }
  
  Sprite.prototype.addAnimation = function(animation) {
    var self = this;
    animation.signals.completed.add(function() {
      delete(self.animations[animation.type]);
      if (isEmpty(self.animations)) {
        self.signals.animationsFinished.dispatch(self);
      }
    });
    this.animations[animation.type] = animation;
  }
  
  Sprite.prototype.clearAnimations = function() {
    this.animations = [];
  }
  
  Sprite.prototype.finishAnimations = function() {
    for (var index in this.animations) {
      this.animations[index].mode = this.animations[index].modes.stopping;
    }
    return this;
  }
  
  function rand(max) {
    return Math.floor(Math.random() * (max + 1) );
  }
  
  function isEmpty(map) {
    for(var key in map) {
      if (map.hasOwnProperty(key)) {
        return false;
      }
      
    }
    return true;
  }
  
  
  
  Sprite.prototype.loadImages = function() {
    var imagesLoaded = new $.Deferred();
    var loadedCount = 0;
    
    img[0] = new Image();
    img[0].src = 'images/red.png';
    img[1] = new Image();
    img[1].src = 'images/green.png';
    img[2] = new Image();
    img[2].src = 'images/blue.png';
    img[3] = new Image();
    img[3].src = 'images/yellow.png';
   
    
    for (var index in img) {
      img[index].addEventListener('load', function() {
        loadedCount++;
        if (loadedCount == img.length) {
          prescaleImages();
          imagesLoaded.resolve();
        }
      }, false);
      
    }
    
    return imagesLoaded;
  }
  
  function prescaleImages() {
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = 32;
    var ctx = canvas.getContext('2d');
    var image = null;
    var pixelSize = 0;
    for (var index = 0; index < img.length; index++) {
      scaledImg[index] = [];
      for (var size = 0; size < 16; size ++) {
        pixelSize = (size + 1) * 2;
        canvas.width = canvas.height = pixelSize;
        image = new Image();
        image.width = image.height = pixelSize;
        ctx.clearRect(0, 0, pixelSize, pixelSize);
        ctx.drawImage(img[index], 0, 0, 111, 111, 0, 0, pixelSize, pixelSize);
        image.src = canvas.toDataURL("image/png");
        scaledImg[index].push(image);
      }
    }
  }
  
  return Sprite;
});