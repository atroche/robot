define(['signals', 'animations'], function(signals, animations) {
   
 var Animation = function(type, opts, watcher) { 
   this.signals = {
     completed: new signals.Signal(),
     started: new signals.Signal()
   };
   if (!opts) opts = {};
   this.worker = animations[type];
   this.worker.init.call(this, opts);
   this.mode = this.modes.queued;
   this.type = type;
   
   if (watcher) {
     watcher.addWatchedAnimation(this);
   }
 }
 
 Animation.prototype.tick = function(sprite) {
   this.worker.tick.call(this, sprite);
 }
 
 Animation.prototype.modes = {
   queued: 0,
   playing: 1,
   stopping: 2,
   complete: 3   
 }
 
 
  
  return Animation;
});