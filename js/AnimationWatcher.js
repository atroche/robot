define(['signals'], function(signals) {
  var AnimationWatcher = function () { 
    this.watches = 0;
    this.signals = {
      finished: new signals.Signal()
    };
  }
  
  AnimationWatcher.prototype.addWatchedAnimation = function(animation) {
    var self = this;
    animation.signals.completed.addOnce(function(animation) {
        self._handleFinished.call(self, animation);
      });
    this.watches++
  }
  
  AnimationWatcher.prototype._handleFinished = function(animation) {
    this.watches--;
    if (this.watches == 0) {
      this.signals.finished.dispatch();
    }
  }
  
  return AnimationWatcher;
});