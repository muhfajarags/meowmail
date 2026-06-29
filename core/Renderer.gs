var Renderer = (function () {
  function render(node, data, escapeHtml) {
    if (data === null || data === undefined) data = {};
    var scopes = [data];
    return renderNode(node, scopes, escapeHtml !== false);
  }

  function resolveValue(key, scopes) {
    if (key === '.') {
      var top = scopes[scopes.length - 1];
      if (top && typeof top === 'object' && top.hasOwnProperty('.')) return top['.'];
      return top;
    }
    if (key.charAt(0) === '@') {
      for (var s = scopes.length - 1; s >= 0; s--) {
        if (scopes[s].hasOwnProperty(key)) return scopes[s][key];
      }
      return undefined;
    }
    var parts = key.split('.');
    for (var s = scopes.length - 1; s >= 0; s--) {
      var val = scopes[s];
      var found = true;
      for (var p = 0; p < parts.length; p++) {
        if (val === null || val === undefined || typeof val !== 'object') {
          found = false;
          break;
        }
        val = val[parts[p]];
        if (p < parts.length - 1 && (val === null || val === undefined)) {
          found = false;
          break;
        }
      }
      if (found && val !== undefined) return val;
    }
    return undefined;
  }

  function renderNode(node, scopes, escapeHtml) {
    switch (node.type) {
      case 'ROOT': {
        var out = [];
        for (var i = 0; i < node.children.length; i++) {
          out.push(renderNode(node.children[i], scopes, escapeHtml));
        }
        return out.join('');
      }

      case 'TEXT':
        return node.value;

      case 'PLACEHOLDER': {
        var val = resolveValue(node.key, scopes);
        if (val === null || val === undefined) val = '';
        for (var i = 0; i < node.filters.length; i++) {
          val = FilterRegistry.apply(node.filters[i].name, val, node.filters[i].arg);
        }
        return escapeHtml ? HtmlEscaper.escape(String(val)) : String(val);
      }

      case 'RAW': {
        var val = resolveValue(node.key, scopes);
        if (val === null || val === undefined) val = '';
        for (var i = 0; i < node.filters.length; i++) {
          val = FilterRegistry.apply(node.filters[i].name, val, node.filters[i].arg);
        }
        return String(val);
      }

      case 'AT_INDEX': {
        var v = resolveValue('@index', scopes);
        return v !== undefined ? String(v) : '';
      }
      case 'AT_FIRST': {
        var v = resolveValue('@first', scopes);
        return v !== undefined ? String(v) : '';
      }
      case 'AT_LAST': {
        var v = resolveValue('@last', scopes);
        return v !== undefined ? String(v) : '';
      }

      case 'IF': {
        var cond = resolveValue(node.condition, scopes);
        var branch = cond ? node.children : node.elseChildren;
        var out = [];
        for (var i = 0; i < branch.length; i++) {
          out.push(renderNode(branch[i], scopes, escapeHtml));
        }
        return out.join('');
      }

      case 'EACH': {
        var arr = resolveValue(node.array, scopes);
        if (!Array.isArray(arr)) return '';
        var out = [];
        for (var i = 0; i < arr.length; i++) {
          var item = arr[i];
          var itemScope = {};
          if (item !== null && typeof item === 'object') {
            for (var k in item) {
              if (item.hasOwnProperty(k)) itemScope[k] = item[k];
            }
          } else {
            itemScope['.'] = item;
          }
          itemScope['@index'] = i;
          itemScope['@first'] = i === 0;
          itemScope['@last'] = i === arr.length - 1;

          scopes.push(itemScope);
          for (var j = 0; j < node.children.length; j++) {
            out.push(renderNode(node.children[j], scopes, escapeHtml));
          }
          scopes.pop();
        }
        return out.join('');
      }

      default:
        return '';
    }
  }

  return { render: render };
})();
