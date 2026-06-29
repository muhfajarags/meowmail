var TextStripper = (function () {
  var blockTagRe = /<\/?(?:div|p|h[1-6]|li|ol|ul|blockquote|pre|table|tr|td|th|header|footer|section|article|nav|br)[^>]*>/gi;
  var tagRe = /<[^>]+>/g;
  var entitiesRe = /&(?:nbsp|amp|lt|gt|quot|#\d+);/g;
  var horizWsRe = /[ \t]+/g;
  var lineRe = /\n{2,}/g;
  var trailingWsRe = /[ \t]+\n/g;

  function strip(html) {
    var text = html;
    text = text.replace(blockTagRe, '\n');
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(tagRe, '');
    text = text.replace(entitiesRe, function (m) {
      if (m === '&nbsp;') return ' ';
      if (m === '&amp;') return '&';
      if (m === '&lt;') return '<';
      if (m === '&gt;') return '>';
      if (m === '&quot;') return '"';
      if (m.indexOf('&#') === 0) {
        var code = parseInt(m.slice(2, -1), 10);
        return isNaN(code) ? m : String.fromCharCode(code);
      }
      return m;
    });
    text = text.replace(horizWsRe, ' ');
    text = text.replace(trailingWsRe, '\n');
    text = text.replace(lineRe, '\n');
    text = text.replace(trailingWsRe, '\n');
    return text.trim();
  }

  return { strip: strip };
})();
