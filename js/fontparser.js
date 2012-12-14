define(['FontParserResult'], function(FontParserResult) {

  var fontparser = {};

  fontparser.start = function(slides) {

    var fontParserResult = new FontParserResult(slides)
    var promise = fontParserResult.promise;
    var timeout = null;

    promise.progress(function() {
      timeout = setTimeout(function() {fontparser.process(fontParserResult);}, 10);
    });

    timeout = setTimeout(function() {fontparser.process(fontParserResult);}, 10);

    return promise;
  }

  fontparser.process = function(fontParserResult) {
    var pass = fontParserResult.getNextJob();

    if (pass === null) return;

    var ctx = pass.ctx;
    ctx.fillStyle = "black";
    var size = pass.size;
    var coords = [];

    var halfSize = Math.ceil(pass.size / 2);
    var resolution = Math.ceil(pass.size / 3);
    var offsetX = Math.round(pass.width / 2);

    for (var y = 0; y < fontParserResult.height; y += resolution) {
      lineData = ctx.getImageData(0, y, pass.width, 1).data;
      for (var x = 0; x < pass.width; x += resolution) {
        r = lineData[x * 4];
        if (r > 0) {
          pixelParseData = ctx.getImageData(x - halfSize,y - halfSize,size,size).data;
          if (pixelIsSize(pixelParseData, size)) {
            coords.push([x - offsetX, y - 200,size]);
            ctx.beginPath();
            ctx.arc(x, y, halfSize, 0, Math.PI*2, true);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
    }

    fontParserResult.addCoords(pass.slide, coords)
  }

  function pixelIsSize(data, size) {
    var rx = ry = 0;
    var origin = Math.round(size / 2);
    var halfSize = origin;
    for (var lookahead = 1; lookahead <= halfSize; lookahead ++) {
      rx = data[((lookahead + origin) * 4)];
      ry = data[((lookahead + origin) * 4 * halfSize) + 4];
      rxMinus = data[((-lookahead + origin) * 4)];
      ryMinus = data[((-lookahead + origin) * 4 * halfSize) + 4];
      if (rx == 0 || ry == 0 || rxMinus == 0 || ryMinus == 0 ) {
        return false;
      }
    }
    return true;
  }

  return fontparser;

});