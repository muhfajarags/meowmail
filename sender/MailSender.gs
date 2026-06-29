function SendError(message) {
  this.name = 'SendError';
  this.message = message || '';
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, SendError);
  }
}
SendError.prototype = Object.create(Error.prototype);
SendError.prototype.constructor = SendError;

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
    var retries = opts.retries !== undefined ? opts.retries : 1;

    for (var attempt = 0; attempt <= retries; attempt++) {
      if (attempt > 0) {
        Utilities.sleep(1000);
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
      }
    }

    throw new SendError('Failed to send email to ' + opts.to + ': ' + lastError.message);
  };

  return MailSender;
})();
