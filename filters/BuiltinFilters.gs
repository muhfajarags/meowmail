var BuiltinFilters = (function () {
  function init() {
    FilterRegistry.register('date', function (value, format) {
      if (value === null || value === undefined || value === '') return '';
      if (value instanceof Date) {
        var d = value;
      } else {
        var d = new Date(value);
        if (isNaN(d.getTime())) return String(value);
      }
      if (format) {
        return Utilities.formatDate(d, Session.getScriptTimeZone(), format);
      }
      var day = d.getDate();
      var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
      var month = monthNames[d.getMonth()];
      var year = d.getFullYear();
      return day + ' ' + month + ' ' + year;
    });

    FilterRegistry.register('currency', function (value) {
      var num = Number(value);
      if (isNaN(num)) return String(value);
      return 'Rp ' + num.toLocaleString('id-ID');
    });

    FilterRegistry.register('upper', function (value) {
      return String(value).toUpperCase();
    });

    FilterRegistry.register('lower', function (value) {
      return String(value).toLowerCase();
    });

    FilterRegistry.register('capitalize', function (value) {
      return String(value).replace(/\b\w/g, function (ch) { return ch.toUpperCase(); });
    });

    FilterRegistry.register('truncate', function (value, n) {
      var str = String(value);
      var len = (n !== null && n !== undefined) ? Number(n) : 100;
      if (isNaN(len)) len = 100;
      if (str.length <= len) return str;
      return str.substring(0, len) + '...';
    });

    FilterRegistry.register('default', function (value, fallback) {
      if (value === null || value === undefined || value === '') {
        return fallback || '';
      }
      return value;
    });

    FilterRegistry.register('nl2br', function (value) {
      return String(value).replace(/\n/g, '<br>');
    });

    FilterRegistry.register('json', function (value) {
      return JSON.stringify(value);
    });
  }

  return { init: init };
})();
