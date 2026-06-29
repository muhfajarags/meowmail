var HtmlEscaper = (function () {
  var ENTITY_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  function escape(str) {
    return String(str).replace(/[&<>"']/g, function (ch) {
      return ENTITY_MAP[ch];
    });
  }

  var REVERSE_MAP = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&#x2F;': '/'
  };

  function unescape(str) {
    return String(str).replace(/&(?:amp|lt|gt|quot|#39|#x27|#x2F);/g, function (entity) {
      return REVERSE_MAP[entity] || entity;
    });
  }

  return { escape: escape, unescape: unescape };
})();
