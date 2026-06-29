function testFilter_upper() {
  Logger.log('testFilter_upper');
  assertEqual(FilterRegistry.apply('upper', 'budi'), 'BUDI');
  assertEqual(FilterRegistry.apply('upper', ''), '');
  Logger.log('  PASS');
}

function testFilter_lower() {
  Logger.log('testFilter_lower');
  assertEqual(FilterRegistry.apply('lower', 'BUDI'), 'budi');
  Logger.log('  PASS');
}

function testFilter_capitalize() {
  Logger.log('testFilter_capitalize');
  assertEqual(FilterRegistry.apply('capitalize', 'budi santoso'), 'Budi Santoso');
  Logger.log('  PASS');
}

function testFilter_currency() {
  Logger.log('testFilter_currency');
  var result = FilterRegistry.apply('currency', 150000);
  assertEqual(typeof result, 'string');
  assert(result.indexOf('Rp') === 0);
  Logger.log('  PASS');
}

function testFilter_date() {
  Logger.log('testFilter_date');
  var d = new Date(2025, 0, 12);
  var result = FilterRegistry.apply('date', d);
  assertEqual(result, '12 Jan 2025');
  Logger.log('  PASS');
}

function testFilter_dateWithFormat() {
  Logger.log('testFilter_dateWithFormat');
  var d = new Date(2025, 0, 12);
  var result = FilterRegistry.apply('date', d, 'dd/MM/yyyy');
  assertEqual(result, '12/01/2025');
  Logger.log('  PASS');
}

function testFilter_default() {
  Logger.log('testFilter_default');
  assertEqual(FilterRegistry.apply('default', null, 'N/A'), 'N/A');
  assertEqual(FilterRegistry.apply('default', undefined, 'N/A'), 'N/A');
  assertEqual(FilterRegistry.apply('default', '', 'N/A'), 'N/A');
  assertEqual(FilterRegistry.apply('default', 'Budi', 'N/A'), 'Budi');
  assertEqual(FilterRegistry.apply('default', 0, 'N/A'), 0);
  Logger.log('  PASS');
}

function testFilter_truncate() {
  Logger.log('testFilter_truncate');
  var long = 'Hello World This Is Long';
  assertEqual(FilterRegistry.apply('truncate', long, 5), 'Hello...');
  assertEqual(FilterRegistry.apply('truncate', 'Hi', 5), 'Hi');
  Logger.log('  PASS');
}

function testFilter_nl2br() {
  Logger.log('testFilter_nl2br');
  assertEqual(FilterRegistry.apply('nl2br', 'A\nB'), 'A<br>B');
  Logger.log('  PASS');
}

function testFilter_json() {
  Logger.log('testFilter_json');
  assertEqual(FilterRegistry.apply('json', { a: 1 }), '{"a":1}');
  Logger.log('  PASS');
}

function testFilter_unknown() {
  Logger.log('testFilter_unknown');
  assertEqual(FilterRegistry.apply('nonexistent', 'test'), 'test');
  Logger.log('  PASS');
}

function testFilter_custom() {
  Logger.log('testFilter_custom');
  FilterRegistry.register('salam', function (v) { return 'Halo, ' + v + '!'; });
  assertEqual(FilterRegistry.apply('salam', 'Budi'), 'Halo, Budi!');
  Logger.log('  PASS');
}

function runFilterTests() {
  Logger.log('=== Filter Tests ===');
  testFilter_upper();
  testFilter_lower();
  testFilter_capitalize();
  testFilter_currency();
  testFilter_date();
  testFilter_dateWithFormat();
  testFilter_default();
  testFilter_truncate();
  testFilter_nl2br();
  testFilter_json();
  testFilter_unknown();
  testFilter_custom();
  Logger.log('=== All Filter Tests Passed ===');
}

function runAllTests() {
  runParserTests();
  runRendererTests();
  runFilterTests();
  Logger.log('=== ALL TESTS PASSED ===');
}

function assert(condition, msg) {
  if (!condition) throw new Error('Assertion failed: ' + (msg || ''));
}

function assertEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error(
      'Expected ' + JSON.stringify(expected) + ' but got ' + JSON.stringify(actual)
    );
  }
}
