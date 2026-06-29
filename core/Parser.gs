var Parser = (function () {
  var TAG_OPEN = '{{';
  var TAG_CLOSE = '}}';
  var RAW_OPEN = '{{{';
  var RAW_CLOSE = '}}}';

  function parse(template) {
    var tokens = tokenize(template);
    return buildTree(tokens);
  }

  function tokenize(template) {
    var tokens = [];
    var i = 0;
    var len = template.length;
    var textBuf = [];

    while (i < len) {
      if (template.substr(i, 3) === RAW_OPEN) {
        flushText();
        var end = template.indexOf(RAW_CLOSE, i + 3);
        if (end === -1) {
          throw new TemplateError('Unclosed raw placeholder at position ' + i);
        }
        var content = template.substring(i + 3, end).trim();
        tokens.push(parsePlaceholderTag(content, true));
        i = end + 3;
        continue;
      }

      if (template.substr(i, 2) === TAG_OPEN) {
        flushText();
        var end = template.indexOf(TAG_CLOSE, i + 2);
        if (end === -1) {
          throw new TemplateError('Unclosed tag at position ' + i);
        }
        var tagContent = template.substring(i + 2, end).trim();
        tokens.push(parseTag(tagContent));
        i = end + 2;
        continue;
      }

      textBuf.push(template.charAt(i));
      i++;
    }

    flushText();

    function flushText() {
      if (textBuf.length > 0) {
        tokens.push({ type: 'TEXT', value: textBuf.join('') });
        textBuf = [];
      }
    }

    return tokens;
  }

  function parseTag(content) {
    if (content === '') {
      throw new TemplateError('Empty tag');
    }

    if (content.indexOf('#if') === 0) {
      if (content === '#if') {
        throw new TemplateError('Missing condition after #if');
      }
      var cond = content.substring(3).trim();
      if (cond === '') {
        throw new TemplateError('Missing condition after #if');
      }
      return { type: 'IF', condition: cond };
    }

    if (content === '/if') {
      return { type: 'ENDIF' };
    }

    if (content.indexOf('#each') === 0) {
      if (content === '#each') {
        throw new TemplateError('Missing array after #each');
      }
      var arr = content.substring(5).trim();
      if (arr === '') {
        throw new TemplateError('Missing array after #each');
      }
      return { type: 'EACH', array: arr };
    }

    if (content === '/each') {
      return { type: 'ENDEACH' };
    }

    if (content === '#else' || content === 'else') {
      return { type: 'ELSE' };
    }

    if (content === '@index') return { type: 'AT_INDEX' };
    if (content === '@first') return { type: 'AT_FIRST' };
    if (content === '@last') return { type: 'AT_LAST' };

    if (content.indexOf('#') === 0) {
      throw new TemplateError('Unknown block tag: ' + content);
    }

    return parsePlaceholderTag(content, false);
  }

  function parsePlaceholderTag(content, raw) {
    var parts = content.split('|');
    var key = parts[0].trim();
    var filters = [];

    for (var i = 1; i < parts.length; i++) {
      var fp = parts[i].trim();
      filters.push(parseFilter(fp));
    }

    return { type: raw ? 'RAW' : 'PLACEHOLDER', key: key, filters: filters };
  }

  function parseFilter(fp) {
    var colonIdx = fp.indexOf(':');
    if (colonIdx === -1) {
      return { name: fp, arg: null };
    }
    var name = fp.substring(0, colonIdx).trim();
    var argStr = fp.substring(colonIdx + 1).trim();

    var arg;
    if (argStr.length >= 2 && argStr.charAt(0) === '"' && argStr.charAt(argStr.length - 1) === '"') {
      arg = argStr.substring(1, argStr.length - 1);
    } else if (argStr.length >= 2 && argStr.charAt(0) === "'" && argStr.charAt(argStr.length - 1) === "'") {
      arg = argStr.substring(1, argStr.length - 1);
    } else if (argStr === '') {
      arg = '';
    } else {
      var num = Number(argStr);
      arg = isNaN(num) ? argStr : num;
    }

    return { name: name, arg: arg };
  }

  function buildTree(tokens) {
    var root = { type: 'ROOT', children: [] };
    var stack = [{ node: root, collectingElse: false }];

    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i];
      var frame = stack[stack.length - 1];
      var target = frame.collectingElse ? frame.node.elseChildren : frame.node.children;

      switch (tok.type) {
        case 'TEXT':
        case 'PLACEHOLDER':
        case 'RAW':
        case 'AT_INDEX':
        case 'AT_FIRST':
        case 'AT_LAST':
          target.push(tok);
          break;

        case 'ELSE':
          if (frame.node.type !== 'IF') {
            throw new TemplateError('Unexpected {{else}} outside of #if block');
          }
          frame.collectingElse = true;
          break;

        case 'IF':
          var ifNode = { type: 'IF', condition: tok.condition, children: [], elseChildren: [] };
          target.push(ifNode);
          stack.push({ node: ifNode, collectingElse: false });
          break;

        case 'ENDIF':
          if (stack.length < 2 || frame.node.type !== 'IF') {
            throw new TemplateError('Unexpected {{/if}}');
          }
          stack.pop();
          break;

        case 'EACH':
          var eachNode = { type: 'EACH', array: tok.array, children: [] };
          target.push(eachNode);
          stack.push({ node: eachNode, collectingElse: false });
          break;

        case 'ENDEACH':
          if (stack.length < 2 || frame.node.type !== 'EACH') {
            throw new TemplateError('Unexpected {{/each}}');
          }
          stack.pop();
          break;
      }
    }

    if (stack.length > 1) {
      var depth = stack.length - 1;
      var top = stack[depth];
      var desc = top.node.type === 'IF' ? '#if' : '#each';
      throw new TemplateError('Unclosed ' + desc + ' block');
    }

    return root;
  }

  return { parse: parse };
})();
