function testRenderer_basicPlaceholder() {
  Logger.log('testRenderer_basicPlaceholder');
  var compiled = Compiler.compile('Halo {{nama}}!');
  var result = compiled.render({ nama: 'Budi' });
  assertEqual(result, 'Halo Budi!');
  Logger.log('  PASS');
}

function testRenderer_missingKey() {
  Logger.log('testRenderer_missingKey');
  var compiled = Compiler.compile('{{missing}}');
  var result = compiled.render({});
  assertEqual(result, '');
  Logger.log('  PASS');
}

function testRenderer_nestedObject() {
  Logger.log('testRenderer_nestedObject');
  var compiled = Compiler.compile('{{user.profile.nama}}');
  var result = compiled.render({ user: { profile: { nama: 'Budi' } } });
  assertEqual(result, 'Budi');
  Logger.log('  PASS');
}

function testRenderer_rawPlaceholder() {
  Logger.log('testRenderer_rawPlaceholder');
  var compiled = Compiler.compile('{{{html}}}');
  var result = compiled.render({ html: '<b>bold</b>' });
  assertEqual(result, '<b>bold</b>');
  Logger.log('  PASS');
}

function testRenderer_htmlEscaping() {
  Logger.log('testRenderer_htmlEscaping');
  var compiled = Compiler.compile('{{content}}');
  var result = compiled.render({ content: '<script>alert("xss")</script>' });
  assertEqual(result, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  Logger.log('  PASS');
}

function testRenderer_ifTrue() {
  Logger.log('testRenderer_ifTrue');
  var compiled = Compiler.compile('{{#if aktif}}YA{{/if}}');
  var result = compiled.render({ aktif: true });
  assertEqual(result, 'YA');
  Logger.log('  PASS');
}

function testRenderer_ifFalse() {
  Logger.log('testRenderer_ifFalse');
  var compiled = Compiler.compile('{{#if aktif}}YA{{/if}}');
  var result = compiled.render({ aktif: false });
  assertEqual(result, '');
  Logger.log('  PASS');
}

function testRenderer_ifElse() {
  Logger.log('testRenderer_ifElse');
  var compiled = Compiler.compile('{{#if premium}}Yes{{else}}No{{/if}}');
  assertEqual(compiled.render({ premium: true }), 'Yes');
  assertEqual(compiled.render({ premium: false }), 'No');
  assertEqual(compiled.render({}), 'No');
  Logger.log('  PASS');
}

function testRenderer_eachBasic() {
  Logger.log('testRenderer_eachBasic');
  var compiled = Compiler.compile('{{#each items}}<li>{{name}}</li>{{/each}}');
  var result = compiled.render({
    items: [{ name: 'A' }, { name: 'B' }]
  });
  assertEqual(result, '<li>A</li><li>B</li>');
  Logger.log('  PASS');
}

function testRenderer_eachWithIndex() {
  Logger.log('testRenderer_eachWithIndex');
  var compiled = Compiler.compile('{{#each items}}{{@index}}:{{name}} {{/each}}');
  var result = compiled.render({
    items: [{ name: 'A' }, { name: 'B' }]
  });
  assertEqual(result.trim(), '0:A 1:B');
  Logger.log('  PASS');
}

function testRenderer_eachWithFirstLast() {
  Logger.log('testRenderer_eachWithFirstLast');
  var compiled = Compiler.compile(
    '{{#each items}}{{#if @first}}FIRST{{/if}}{{name}}{{#if @last}}LAST{{/if}}{{/each}}'
  );
  var result = compiled.render({
    items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }]
  });
  assertEqual(result, 'FIRSTABCLAST');
  Logger.log('  PASS');
}

function testRenderer_emptyEach() {
  Logger.log('testRenderer_emptyEach');
  var compiled = Compiler.compile('{{#each items}}X{{/each}}');
  assertEqual(compiled.render({ items: [] }), '');
  assertEqual(compiled.render({}), '');
  Logger.log('  PASS');
}

function testRenderer_nestedEach() {
  Logger.log('testRenderer_nestedEach');
  var tpl = '{{#each orders}}{{orderId}}:{{#each items}}{{name}},{{/each}};{{/each}}';
  var compiled = Compiler.compile(tpl);
  var result = compiled.render({
    orders: [
      { orderId: '1', items: [{ name: 'A' }, { name: 'B' }] },
      { orderId: '2', items: [{ name: 'C' }] }
    ]
  });
  assertEqual(result, '1:A,B,;2:C,;');
  Logger.log('  PASS');
}

function testRenderer_nestedIfInsideEach() {
  Logger.log('testRenderer_nestedIfInsideEach');
  var compiled = Compiler.compile(
    '{{#each items}}{{#if active}}{{name}}{{/if}}{{/each}}'
  );
  var result = compiled.render({
    items: [{ name: 'A', active: true }, { name: 'B', active: false }, { name: 'C', active: true }]
  });
  assertEqual(result, 'AC');
  Logger.log('  PASS');
}

function testRenderer_filteredOutput() {
  Logger.log('testRenderer_filteredOutput');
  var compiled = Compiler.compile('{{nama | upper}}');
  var result = compiled.render({ nama: 'Budi' });
  assertEqual(result, 'BUDI');
  Logger.log('  PASS');
}

function testRenderer_filterChain() {
  Logger.log('testRenderer_filterChain');
  var compiled = Compiler.compile('{{nama | upper | default:"N/A"}}');
  assertEqual(compiled.render({ nama: 'Budi' }), 'BUDI');
  assertEqual(compiled.render({}), 'N/A');
  Logger.log('  PASS');
}

function testRenderer_plainTextFallback() {
  Logger.log('testRenderer_plainTextFallback');
  var html = '<h1>Halo {{nama}}</h1><p>Selamat datang.</p>';
  var compiled = Compiler.compile(html);
  var rendered = compiled.render({ nama: 'Budi' });
  var text = TextStripper.strip(rendered);
  assertEqual(text, 'Halo Budi\nSelamat datang.');
  Logger.log('  PASS');
}

function testCompiler_cacheBounded() {
  Logger.log('testCompiler_cacheBounded');
  Compiler.clearCache();
  Compiler.setMaxCache(3);
  Compiler.compile('tpl1');
  Compiler.compile('tpl2');
  Compiler.compile('tpl3');
  Compiler.compile('tpl4');
  assertEqual(Compiler.compile('tpl1').tree.type, 'ROOT');
  Compiler.setMaxCache(50);
  Logger.log('  PASS');
}

function runRendererTests() {
  Logger.log('=== Renderer Tests ===');
  testRenderer_basicPlaceholder();
  testRenderer_missingKey();
  testRenderer_nestedObject();
  testRenderer_rawPlaceholder();
  testRenderer_htmlEscaping();
  testRenderer_ifTrue();
  testRenderer_ifFalse();
  testRenderer_ifElse();
  testRenderer_eachBasic();
  testRenderer_eachWithIndex();
  testRenderer_eachWithFirstLast();
  testRenderer_emptyEach();
  testRenderer_nestedEach();
  testRenderer_nestedIfInsideEach();
  testRenderer_filteredOutput();
  testRenderer_filterChain();
  testRenderer_plainTextFallback();
  testCompiler_cacheBounded();
  Logger.log('=== All Renderer Tests Passed ===');
}

function assertEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error(
      'Expected ' + JSON.stringify(expected) + ' but got ' + JSON.stringify(actual)
    );
  }
}
