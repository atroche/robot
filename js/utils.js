define(['jquery'], function($) {
  var utils = {};
  
  utils.rand = function (max) {
    return Math.floor(Math.random() * (max + 1) );
  }
  
  utils.showCentredOverlay = function (element) {
    var $el = $(element), $window = $(window);
    $el.css('top', Math.round($window.height() / 2) - Math.round($el.height() / 2));
    $el.css('left', Math.round($window.width() / 2) - Math.round($el.width() / 2));
    $el.fadeIn();
  }
  
  utils.isCanvasSupported = function (){
    var elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
  }
  
  return utils;
});