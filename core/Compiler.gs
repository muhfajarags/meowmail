var Compiler = (function () {
  var cache = {};

  function compile(templateStr) {
    var cached = cache[templateStr];
    if (cached) return cached;

    var tree = Parser.parse(templateStr);

    var compiled = {
      tree: tree,
      render: function (data, escapeHtml) {
        return Renderer.render(tree, data, escapeHtml);
      }
    };

    cache[templateStr] = compiled;
    return compiled;
  }

  function clearCache() {
    cache = {};
  }

  return { compile: compile, clearCache: clearCache };
})();
