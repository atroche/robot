define(function() {
  var SpriteManager = function() {
    this.sprites = {};
    this.originX = 0;
    this.originY = 0;
    this.spritesToDelete = [];
    this.idCounter = 0;
    this.tags = {};
  }

  SpriteManager.prototype.setOrigin = function(x, y) {
    this.originX = x;
    this.originY = y;
  }

  SpriteManager.prototype.addSprite = function (sprite) {
    this.sprites[this.idCounter] = sprite;
    sprite.id = this.idCounter;
    this.idCounter++;
  }

  // from:
  // http://ejohn.org/blog/javascript-array-remove/
  SpriteManager.prototype.removeSprite = function (sprite) {
    delete(this.sprites[sprite.id]);
    for (var index in this.tags) {
      delete(this.tags[index][sprite.id]);
    }
  }

  SpriteManager.prototype.addSpriteToTag = function (sprite, tag) {
    if (!this.tags[tag]) {
      this.tags[tag] = {};
    }
    this.tags[tag][sprite.id] = sprite;
  }

  SpriteManager.prototype.getSpritesByTag = function (tag) {
    return this.tags[tag];
  }

  SpriteManager.prototype.removeSpriteFromTag = function (sprite, tag) {
    delete(this.tags[tag][sprite.id]);
  }

  SpriteManager.prototype.updateAndRender = function(ctx) {
    var numSpritesToDelete = 0;
    if (numSpritesToDelete = this.spritesToDelete.length) {
      for (var delIndex = 0; delIndex < numSpritesToDelete; delIndex++) {
        this.removeSprite(this.spritesToDelete[delIndex]);
      }
      this.spritesToDelete = [];
    }

    var numSprites = this.sprites.length;

    for (var index in this.sprites) {
      this.sprites[index].render(ctx, this.originX, this.originY);
      this.sprites[index].tick();
    }
  }

  SpriteManager.prototype.removeSpriteOnAnimationsFinished = function (sprite) {
    var self = this;
    sprite.signals.animationsFinished.addOnce(function(s) {
      return function() {
        self.spritesToDelete.push(s);
      }
    }(sprite));
  }

  function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

  return SpriteManager;

});