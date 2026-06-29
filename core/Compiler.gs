var Compiler = (function () {
  var cache = {};
  var cacheKeys = [];
  var MAX_CACHE = 50;

  function compile(templateStr) {
    var cached = cache[templateStr];
    if (cached) {
      moveToRecent(templateStr);
      return cached;
    }

    var tree = Parser.parse(templateStr);

    var compiled = {
      tree: tree,
      render: function (data, escapeHtml) {
        return Renderer.render(tree, data, escapeHtml);
      }
    };

    if (cacheKeys.length >= MAX_CACHE) {
      var oldest = cacheKeys.shift();
      delete cache[oldest];
    }

    cache[templateStr] = compiled;
    cacheKeys.push(templateStr);
    return compiled;
  }

  function moveToRecent(key) {
    var idx = cacheKeys.indexOf(key);
    if (idx > -1) {
      cacheKeys.splice(idx, 1);
      cacheKeys.push(key);
    }
  }

  function clearCache() {
    cache = {};
    cacheKeys = [];
  }

  function setMaxCache(max) {
    MAX_CACHE = max > 0 ? max : 50;
    while (cacheKeys.length > MAX_CACHE) {
      var oldest = cacheKeys.shift();
      delete cache[oldest];
    }
  }

  return { compile: compile, clearCache: clearCache, setMaxCache: setMaxCache };
})();
