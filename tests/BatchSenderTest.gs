function testBatchSender_withArray() {
  Logger.log('testBatchSender_withArray');
  var batch = new BatchSender();
  var builder = MeowMail.create('<p>{{nama}}</p>').subject('Hello {{nama}}');

  var result = batch.send(builder, {
    source: [
      { email: 'a@test.com', nama: 'Alice' },
      { email: 'b@test.com', nama: 'Bob' }
    ],
    toColumn: 'email',
    delay: 0
  });

  assertEqual(result.total, 2);
  Logger.log('  PASS');
}

function testBatchSender_emptySource() {
  Logger.log('testBatchSender_emptySource');
  var batch = new BatchSender();
  var builder = MeowMail.create('test');
  var result = batch.send(builder, { source: [] });
  assertEqual(result.sent, 0);
  assertEqual(result.failed, 0);
  Logger.log('  PASS');
}

function testBatchSender_skipsEmptyEmail() {
  Logger.log('testBatchSender_skipsEmptyEmail');
  var batch = new BatchSender();
  var builder = MeowMail.create('test');
  var result = batch.send(builder, {
    source: [
      { email: '', nama: 'Empty' },
      { email: 'valid@test.com', nama: 'Valid' }
    ],
    toColumn: 'email',
    delay: 0
  });
  assertEqual(result.failed, 1);
  assertEqual(result.sent, 1);
  Logger.log('  PASS');
}

function testBatchSender_withSheetData() {
  Logger.log('testBatchSender_withSheetData');
  var rows = SheetReader.read({
    getDataRange: function () {
      return {
        getValues: function () {
          return [
            ['email', 'nama'],
            ['a@test.com', 'Alice'],
            ['b@test.com', 'Bob']
          ];
        }
      };
    }
  });
  assertEqual(rows.length, 2);
  assertEqual(rows[0].email, 'a@test.com');
  assertEqual(rows[0].nama, 'Alice');
  assertEqual(rows[1].email, 'b@test.com');
  Logger.log('  PASS');
}

function testBatchSender_callbacks() {
  Logger.log('testBatchSender_callbacks');
  var batch = new BatchSender();
  var builder = MeowMail.create('test');
  var successRows = [];
  var errorRows = [];

  var result = batch.send(builder, {
    source: [
      { email: 'a@test.com', nama: 'A' },
      { email: '', nama: 'NoEmail' }
    ],
    toColumn: 'email',
    delay: 0,
    onSuccess: function (row) { successRows.push(row); },
    onError: function (row, err) { errorRows.push({ row: row, err: err }); }
  });

  assertEqual(successRows.length, 1);
  assertEqual(errorRows.length, 1);
  assertEqual(result.sent, 1);
  assertEqual(result.failed, 1);
  Logger.log('  PASS');
}

function testSheetReader_simple() {
  Logger.log('testSheetReader_simple');
  var mockSheet = {
    getDataRange: function () {
      return {
        getValues: function () {
          return [
            ['nama', 'umur'],
            ['Budi', 25],
            ['Siti', 30]
          ];
        }
      };
    }
  };
  var rows = SheetReader.read(mockSheet);
  assertEqual(rows.length, 2);
  assertEqual(rows[0].nama, 'Budi');
  assertEqual(rows[0].umur, 25);
  assertEqual(rows[1].nama, 'Siti');
  Logger.log('  PASS');
}

function testSheetReader_skipsEmptyRows() {
  Logger.log('testSheetReader_skipsEmptyRows');
  var mockSheet = {
    getDataRange: function () {
      return {
        getValues: function () {
          return [
            ['nama'],
            ['Budi'],
            ['', null, ''],
            ['Siti']
          ];
        }
      };
    }
  };
  var rows = SheetReader.read(mockSheet);
  assertEqual(rows.length, 2);
  Logger.log('  PASS');
}

function testBatchSender_validateEmail() {
  Logger.log('testBatchSender_validateEmail');
  var batch = new BatchSender();
  var builder = MeowMail.create('test');
  var result = batch.send(builder, {
    source: [
      { email: 'invalid', nama: 'Bad' },
      { email: 'valid@test.com', nama: 'Good' },
      { email: '', nama: 'Empty' }
    ],
    toColumn: 'email',
    delay: 0,
    validateEmail: true
  });
  assertEqual(result.failed, 2);
  assertEqual(result.sent, 1);
  Logger.log('  PASS');
}

function runBatchSenderTests() {
  Logger.log('=== BatchSender Tests ===');
  testBatchSender_emptySource();
  testBatchSender_skipsEmptyEmail();
  testBatchSender_withSheetData();
  testBatchSender_callbacks();
  testSheetReader_simple();
  testSheetReader_skipsEmptyRows();
  testBatchSender_validateEmail();
  Logger.log('=== All BatchSender Tests Passed ===');
}

function assertEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error(
      'Expected ' + JSON.stringify(expected) + ' but got ' + JSON.stringify(actual)
    );
  }
}
