var FilterRegistry = (function () {
  var filters = {};

  function register(name, fn) {
    if (typeof fn !== 'function') {
      throw new Error('Filter "' + name + '" must be a function');
    }
    filters[name] = fn;
  }

  function apply(name, value, arg) {
    var fn = filters[name];
    if (!fn) {
      return value;
    }
    return fn(value, arg);
  }

  function exists(name) {
    return !!filters[name];
  }

  function list() {
    var keys = [];
    for (var k in filters) {
      if (filters.hasOwnProperty(k)) keys.push(k);
    }
    return keys.sort();
  }

  return { register: register, apply: apply, exists: exists, list: list };
})();
