var MailSender = (function () {
  function MailSender() {}

  MailSender.prototype.send = function (opts) {
    if (!opts || !opts.to) throw new SendError('Recipient email is required');

    var params = {
      to: opts.to,
      subject: opts.subject || '',
      htmlBody: opts.htmlBody || '',
      plainBody: opts.plainBody || ''
    };

    if (opts.from) params.from = opts.from;
    if (opts.replyTo) params.replyTo = opts.replyTo;
    if (opts.cc) params.cc = opts.cc;
    if (opts.bcc) params.bcc = opts.bcc;

    if (!params.plainBody && params.htmlBody) {
      params.plainBody = TextStripper.strip(params.htmlBody);
    }

    var lastError = null;
    var retries = opts.retries !== undefined ? opts.retries : (__MeowMailConfig.maxRetries || 1);

    for (var attempt = 0; attempt <= retries; attempt++) {
      if (attempt > 0) {
        var backoff = Math.pow(2, attempt - 1) * 1000;
        var jitter = Math.random() * 500;
        Utilities.sleep(backoff + jitter);
      }
      try {
        if (params.from) {
          GmailApp.sendEmail(params.to, params.subject, params.plainBody, {
            htmlBody: params.htmlBody,
            from: params.from,
            replyTo: params.replyTo,
            cc: params.cc,
            bcc: params.bcc
          });
        } else {
          GmailApp.sendEmail(params.to, params.subject, params.plainBody, {
            htmlBody: params.htmlBody,
            replyTo: params.replyTo,
            cc: params.cc,
            bcc: params.bcc
          });
        }
        return { success: true, to: opts.to };
      } catch (e) {
        lastError = e;
        MeowMailLogger.warn('Send attempt %s failed for %s: %s', attempt + 1, opts.to, e.message);
      }
    }

    throw new SendError('Failed to send email to ' + opts.to + ': ' + lastError.message);
  };

  return MailSender;
})();
