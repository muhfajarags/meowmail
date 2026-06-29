var SheetReader = (function () {
  function read(sheet) {
    var range = sheet.getDataRange();
    var values = range.getValues();

    if (values.length < 2) {
      return [];
    }

    var headers = values[0];
    var result = [];

    for (var r = 1; r < values.length; r++) {
      var row = values[r];
      var obj = {};
      var empty = true;

      for (var c = 0; c < headers.length; c++) {
        var header = String(headers[c]).trim();
        if (header === '') continue;
        var val = c < row.length ? row[c] : '';
        obj[header] = val;
        if (val !== '' && val !== null && val !== undefined) {
          empty = false;
        }
      }

      if (!empty) {
        result.push(obj);
      }
    }

    return result;
  }

  return { read: read };
})();
