var __MeowMailConfig = {
  defaultFrom: null,
  defaultReplyTo: null,
  defaultDelay: 200,
  maxPerRun: 100,
  quotaBuffer: 10,
  escapeHtml: true,
  locale: 'id-ID',
  logLevel: 'INFO',
  maxRetries: 1,
  validateEmail: false,
  maxCache: 50
};

var MeowMail = (function () {
  BuiltinFilters.init();
  MeowMailLogger.setLevel(__MeowMailConfig.logLevel);

  /**
   * @param {string} templateStr
   * @constructor
   */
  function TemplateBuilder(templateStr) {
    this.templateStr = templateStr;
    this.subjectStr = '';
    this.fromAddr = null;
    this.replyToAddr = null;
  }

  /**
   * @param {string} str
   * @returns {TemplateBuilder}
   */
  TemplateBuilder.prototype.subject = function (str) {
    this.subjectStr = str;
    return this;
  };

  /**
   * @param {string} addr
   * @returns {TemplateBuilder}
   */
  TemplateBuilder.prototype.from = function (addr) {
    this.fromAddr = addr;
    return this;
  };

  /**
   * @param {string} addr
   * @returns {TemplateBuilder}
   */
  TemplateBuilder.prototype.replyTo = function (addr) {
    this.replyToAddr = addr;
    return this;
  };

  /**
   * @param {Object} data
   * @returns {Object}
   */
  TemplateBuilder.prototype.send = function (data) {
    if (!data) throw new SendError('Data is required');
    if (!data.to) throw new SendError('Recipient email is required');

    var compiled = Compiler.compile(this.templateStr);
    var html = compiled.render(data, __MeowMailConfig.escapeHtml);
    var text = TextStripper.strip(html);

    var subject = '';
    if (this.subjectStr) {
      var subCompiled = Compiler.compile(this.subjectStr);
      subject = subCompiled.render(data, false);
    }

    var mailer = new MailSender();
    return mailer.send({
      to: data.to,
      subject: subject,
      htmlBody: html,
      plainBody: text,
      from: this.fromAddr || __MeowMailConfig.defaultFrom,
      replyTo: this.replyToAddr || __MeowMailConfig.defaultReplyTo
    });
  };

  /**
   * @param {Object} opts
   * @returns {Object}
   */
  TemplateBuilder.prototype.sendBatch = function (opts) {
    opts = opts || {};
    if (opts.delay === undefined && __MeowMailConfig.defaultDelay) {
      opts.delay = __MeowMailConfig.defaultDelay;
    }
    var batch = new BatchSender();
    return batch.send(this, opts);
  };

  /**
   * @param {Object} data
   * @returns {{html: string, text: string, subject: string}}
   */
  TemplateBuilder.prototype.preview = function (data) {
    if (!data) data = {};
    var compiled = Compiler.compile(this.templateStr);
    var html = compiled.render(data, __MeowMailConfig.escapeHtml);
    var text = TextStripper.strip(html);

    var subject = '';
    if (this.subjectStr) {
      var subCompiled = Compiler.compile(this.subjectStr);
      subject = subCompiled.render(data, false);
    }

    return { html: html, text: text, subject: subject };
  };

  var api = {
    /**
     * @param {string} templateStr
     * @returns {TemplateBuilder}
     */
    create: function (templateStr) {
      return new TemplateBuilder(templateStr);
    },

    /**
     * @param {Object} opts
     */
    configure: function (opts) {
      if (!opts) return;
      for (var key in opts) {
        if (opts.hasOwnProperty(key) && __MeowMailConfig.hasOwnProperty(key)) {
          __MeowMailConfig[key] = opts[key];
        }
      }
      if (opts.logLevel) MeowMailLogger.setLevel(opts.logLevel);
      if (opts.maxCache) Compiler.setMaxCache(opts.maxCache);
    },

    /**
     * @param {string} name
     * @param {Function} fn
     */
    registerFilter: function (name, fn) {
      FilterRegistry.register(name, fn);
    }
  };

  return api;
})();
