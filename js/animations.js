define(function() {
  var animations = {
    moveRandomlyX: {},
    moveRandomlyY: {},
    moveTo: {},
    fadeIn: {},
    explode: {},
    fadeOut: {},
    flash: {},
    explodeTo: {}
  };
  
  animations.moveRandomlyX.init = function(opts) {
    this.opts = opts;
    this.dest = rand(this.opts.max * 2) - this.opts.max;
    this.time = 0;
    this.start = opts.start;
    this.period = this.opts.period;
  }
   
  animations.moveRandomlyX.tick = function(sprite) {
    if (this.time == this.period) {
      if (this.mode == this.modes.stopping) {
        this.signals.completed.dispatch(this);
        return;
      }
      this.start = this.dest
      this.dest = rand(this.opts.max * 2) - this.opts.max;
      this.time = 0;
      this.period = rand(200) + 100;
    }
   
   sprite.x = easeInOutSine(this.time, this.start, this.dest - this.start, this.period);
    this.time++;    
  }
  
  
  
  
  
  
  animations.moveRandomlyY.init = function(opts) {
    this.opts = opts;
    this.dest = rand(this.opts.max * 2) - this.opts.max;
    this.time = 0;
    this.start = opts.start;
    this.period = this.opts.period;
  }
   
  animations.moveRandomlyY.tick = function(sprite) {
    if (this.time == this.period) {
      if (this.mode == this.modes.stopping) {
        this.signals.completed.dispatch(this);
        return;
      }
      
      this.start = this.dest
      this.dest = rand(this.opts.max * 2) - this.opts.max;
      this.time = 0;
      this.period = rand(200) + 100;
    }
   
   sprite.y = easeInOutSine(this.time, this.start, this.dest - this.start, this.period);
    this.time++;    
  }
  
  
  
    animations.moveTo.init = function(opts) {
    this.opts = opts;
    this.destX = opts.x;
    this.destY = opts.y;
    this.time = 0;
    this.startX = null;
    this.startY = null;
    this.period = this.opts.period;
  }
   
  animations.moveTo.tick = function(sprite) {

    
    if (this.startX == null) {
      this.startX = sprite.x;
      this.startY = sprite.y;
    }
   
   sprite.x = easeInOutSine(this.time, this.startX, this.destX - this.startX, this.period);
   sprite.y = easeInOutSine(this.time, this.startY, this.destY - this.startY, this.period);
   
   if (this.time == this.period) {
      return this.signals.completed.dispatch(this);
   }
   
   this.time++;    
  }
  
  
   
  animations.explodeTo.init = function(opts) {
    this.opts = opts;
    this.dest = [
      [opts.x1, opts.y1],
      [opts.x2, opts.y2]
    ]
    this.destIndex = 0;
    this.time = 0;
    this.startX = null;
    this.startY = null;
    this.period = this.opts.period;
    this.easing = easeOutSine;
  }
   
  animations.explodeTo.tick = function(sprite) {
    if (this.startX == null) {
      this.startX = sprite.x;
      this.startY = sprite.y;
    }
    
    sprite.x = this.easing(this.time, this.startX, this.dest[this.destIndex][0] - this.startX, this.period);
    sprite.y = this.easing(this.time, this.startY, this.dest[this.destIndex][1] - this.startY, this.period);
   
   if (this.time == this.period) {
      if (this.destIndex == 1) {
        return this.signals.completed.dispatch(this);
      }
      this.destIndex++;
      this.easing = easeInSine;
      this.time = 0;
      this.startX = sprite.x;
      this.startY = sprite.y;
    }
   
   this.time++;    
  }
  
  
  animations.fadeIn.init = function(opts) {
    this.period = opts.period || rand(100) + 100;
    this.time = 0;
    this.max = opts.max;
  } 
  
  animations.fadeIn.tick = function(sprite) {  
    sprite.opacity = (this.time / this.period) * this.max;
    if (this.time == this.period) {
      return this.signals.completed.dispatch(this);
    }
    this.time++;
  }
  
  
  
  
  
  
  
  
  
  
  
  
  animations.explode.init = function(opts) {
    this.vx = rand(20) - 10;
    this.vy = rand(20) - 10;
    this.period = rand(50) + 15;
    this.time = 0;
  } 
  
  animations.explode.tick = function(sprite) {  
    sprite.x += this.vx;
    sprite.y += this.vy;
    if (this.vy < (sprite.size * 2)) {
      this.vy++;
    }
    sprite.opacity = 1 - (this.time / this.period);
    if (this.time == this.period) {
      return this.signals.completed.dispatch(this);
    }
    this.time++;
  }
  
  animations.fadeOut.init = function(opts) {
    this.period = 15;
    this.time = 0;
  } 
  
  animations.fadeOut.tick = function(sprite) {  
    sprite.opacity = 1 - (this.time / this.period);
    if (this.time == this.period) {
      return this.signals.completed.dispatch(this);
    }
    this.time++;
  }
  
  
    animations.flash.init = function(opts) {
      this.size = opts.start || 15;
      this.target = opts.target - this.size;
      this.period = opts.period || 32;
      
      this.time = 0;
  } 
  
  animations.flash.tick = function(sprite) {  
    sprite.size = Math.round(this.target * this.time / this.period + this.size);
    if (this.time == this.period) {
      return this.signals.completed.dispatch(this);
    }
    this.time++;
  }
   
  
   
  function easeInOutSine (t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	}
  
  function easeInSine(t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	}
  
  function easeOutSine(t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	}
  
  function easeOutBack (t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	}
  
  function easeInOutBack(t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
  }
  

  function rand(max) {
    return Math.floor(Math.random() * (max + 1) );
  }
   
  return animations;
});