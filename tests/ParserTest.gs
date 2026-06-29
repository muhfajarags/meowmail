function parseAndAssert(template, expected) {
  var result = JSON.stringify(Parser.parse(template));
  var exp = JSON.stringify(expected);
  if (result !== exp) {
    throw new Error('ParserTest FAILED:\n  Template: ' + template + '\n  Expected: ' + exp + '\n  Got: ' + result);
  }
  Logger.log('  PASS: ' + template);
}

function assertThrows(fn, expectedMsg) {
  try {
    fn();
    throw new Error('Expected error but none thrown');
  } catch (e) {
    if (expectedMsg && e.message.indexOf(expectedMsg) === -1) {
      throw new Error('Expected error containing "' + expectedMsg + '" but got: ' + e.message);
    }
  }
}

function testParser_basicPlaceholder() {
  Logger.log('testParser_basicPlaceholder');
  var tree = Parser.parse('Halo {{nama}}!');
  var expected = {
    type: 'ROOT',
    children: [
      { type: 'TEXT', value: 'Halo ' },
      { type: 'PLACEHOLDER', key: 'nama', filters: [] },
      { type: 'TEXT', value: '!' }
    ]
  };
  assertEqual(tree.children.length, 3);
  assertEqual(tree.children[0].value, 'Halo ');
  assertEqual(tree.children[1].type, 'PLACEHOLDER');
  assertEqual(tree.children[1].key, 'nama');
  assertEqual(tree.children[2].value, '!');
  Logger.log('  PASS');
}

function testParser_nestedKey() {
  Logger.log('testParser_nestedKey');
  var tree = Parser.parse('{{user.email}}');
  assertEqual(tree.children[0].type, 'PLACEHOLDER');
  assertEqual(tree.children[0].key, 'user.email');
  Logger.log('  PASS');
}

function testParser_rawPlaceholder() {
  Logger.log('testParser_rawPlaceholder');
  var tree = Parser.parse('{{{html}}}');
  assertEqual(tree.children[0].type, 'RAW');
  assertEqual(tree.children[0].key, 'html');
  Logger.log('  PASS');
}

function testParser_filteredPlaceholder() {
  Logger.log('testParser_filteredPlaceholder');
  var tree = Parser.parse('{{harga | currency}}');
  assertEqual(tree.children[0].filters.length, 1);
  assertEqual(tree.children[0].filters[0].name, 'currency');
  assertEqual(tree.children[0].filters[0].arg, null);
  Logger.log('  PASS');
}

function testParser_filterWithArg() {
  Logger.log('testParser_filterWithArg');
  var tree = Parser.parse('{{tgl | date:"dd/MM/yyyy"}}');
  assertEqual(tree.children[0].filters[0].name, 'date');
  assertEqual(tree.children[0].filters[0].arg, 'dd/MM/yyyy');
  Logger.log('  PASS');
}

function testParser_defaultFilter() {
  Logger.log('testParser_defaultFilter');
  var tree = Parser.parse('{{nama | default:"Pelanggan"}}');
  assertEqual(tree.children[0].filters[0].name, 'default');
  assertEqual(tree.children[0].filters[0].arg, 'Pelanggan');
  Logger.log('  PASS');
}

function testParser_ifBlock() {
  Logger.log('testParser_ifBlock');
  var tree = Parser.parse('{{#if aktif}}A{{/if}}');
  assertEqual(tree.children[0].type, 'IF');
  assertEqual(tree.children[0].condition, 'aktif');
  assertEqual(tree.children[0].children.length, 1);
  assertEqual(tree.children[0].children[0].value, 'A');
  Logger.log('  PASS');
}

function testParser_ifElseBlock() {
  Logger.log('testParser_ifElseBlock');
  var tree = Parser.parse('{{#if ok}}A{{else}}B{{/if}}');
  assertEqual(tree.children[0].type, 'IF');
  assertEqual(tree.children[0].children[0].value, 'A');
  assertEqual(tree.children[0].elseChildren[0].value, 'B');
  Logger.log('  PASS');
}

function testParser_eachBlock() {
  Logger.log('testParser_eachBlock');
  var tree = Parser.parse('{{#each items}}<li>{{name}}</li>{{/each}}');
  assertEqual(tree.children[0].type, 'EACH');
  assertEqual(tree.children[0].array, 'items');
  assertEqual(tree.children[0].children.length, 3);
  Logger.log('  PASS');
}

function testParser_specialTokens() {
  Logger.log('testParser_specialTokens');
  var tree = Parser.parse('{{@index}}-{{@first}}-{{@last}}');
  assertEqual(tree.children[0].type, 'AT_INDEX');
  assertEqual(tree.children[1].type, 'TEXT');
  assertEqual(tree.children[2].type, 'AT_FIRST');
  assertEqual(tree.children[4].type, 'AT_LAST');
  Logger.log('  PASS');
}

function testParser_missingCondition() {
  Logger.log('testParser_missingCondition');
  assertThrows(function () { Parser.parse('{{#if}}'); }, 'Missing condition');
  Logger.log('  PASS');
}

function testParser_missingArray() {
  Logger.log('testParser_missingArray');
  assertThrows(function () { Parser.parse('{{#each}}'); }, 'Missing array');
  Logger.log('  PASS');
}

function testParser_unclosedBlock() {
  Logger.log('testParser_unclosedBlock');
  assertThrows(function () { Parser.parse('{{#if ok}}'); }, 'Unclosed');
  assertThrows(function () { Parser.parse('{{#each items}}'); }, 'Unclosed');
  Logger.log('  PASS');
}

function testParser_unexpectedElse() {
  Logger.log('testParser_unexpectedElse');
  assertThrows(function () { Parser.parse('{{else}}'); }, 'Unexpected');
  Logger.log('  PASS');
}

function testParser_nestedBlocks() {
  Logger.log('testParser_nestedBlocks');
  var tree = Parser.parse('{{#each orders}}{{#if paid}}{{id}}{{/if}}{{/each}}');
  assertEqual(tree.children[0].type, 'EACH');
  assertEqual(tree.children[0].children[0].type, 'IF');
  assertEqual(tree.children[0].children[0].condition, 'paid');
  Logger.log('  PASS');
}

function testParser_multipleFilters() {
  Logger.log('testParser_multipleFilters');
  var tree = Parser.parse('{{nama | upper | default:"N/A"}}');
  assertEqual(tree.children[0].filters.length, 2);
  assertEqual(tree.children[0].filters[0].name, 'upper');
  assertEqual(tree.children[0].filters[1].name, 'default');
  assertEqual(tree.children[0].filters[1].arg, 'N/A');
  Logger.log('  PASS');
}

function runParserTests() {
  Logger.log('=== Parser Tests ===');
  testParser_basicPlaceholder();
  testParser_nestedKey();
  testParser_rawPlaceholder();
  testParser_filteredPlaceholder();
  testParser_filterWithArg();
  testParser_defaultFilter();
  testParser_ifBlock();
  testParser_ifElseBlock();
  testParser_eachBlock();
  testParser_specialTokens();
  testParser_missingCondition();
  testParser_missingArray();
  testParser_unclosedBlock();
  testParser_unexpectedElse();
  testParser_nestedBlocks();
  testParser_multipleFilters();
  Logger.log('=== All Parser Tests Passed ===');
}

function assertEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error('Expected ' + JSON.stringify(expected) + ' but got ' + JSON.stringify(actual));
  }
}
