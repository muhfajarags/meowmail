var BatchSender = (function () {
  function BatchSender() {}

  BatchSender.prototype.send = function (builder, opts) {
    opts = opts || {};
    var rows = [];

    if (Array.isArray(opts.source)) {
      rows = opts.source;
    } else if (opts.source && typeof opts.source.getDataRange === 'function') {
      rows = SheetReader.read(opts.source);
    } else {
      throw new SendError('Invalid batch source: expected array or Sheet');
    }

    if (rows.length === 0) {
      return { sent: 0, failed: 0, errors: [], summary: { success: 0, failed: 0 } };
    }

    var toColumn = opts.toColumn || 'email';
    var delayMs = opts.delay !== undefined ? opts.delay : 200;
    var maxPerRun = opts.maxPerRun || __MeowMailConfig.maxPerRun || 100;
    var quotaBuffer = opts.quotaBuffer || __MeowMailConfig.quotaBuffer || 10;
    var onSuccess = typeof opts.onSuccess === 'function' ? opts.onSuccess : null;
    var onError = typeof opts.onError === 'function' ? opts.onError : null;

    var remaining = MailApp.getRemainingDailyQuota();
    if (remaining < quotaBuffer) {
      throw new SendError(
        'Daily quota too low: ' + remaining + ' remaining (buffer: ' + quotaBuffer + ')'
      );
    }

    var capped = Math.min(rows.length, maxPerRun);
    if (capped < rows.length) {
      Logger.log(
        '[MeowMail] Batch truncated: ' + rows.length + ' rows limited to ' + maxPerRun + ' (maxPerRun)'
      );
    }

    var sent = 0;
    var failed = 0;
    var errors = [];

    var mailer = new MailSender();

    for (var i = 0; i < capped; i++) {
      var row = rows[i];
      var recipient = String(row[toColumn] || '').trim();

      if (!recipient) {
        failed++;
        var err = new SendError('Empty recipient in row ' + (i + 1));
        errors.push({ row: row, error: err });
        if (onError) onError(row, err);
        continue;
      }

      remaining = MailApp.getRemainingDailyQuota();
      if (remaining <= quotaBuffer) {
        Logger.log('[MeowMail] Quota low (' + remaining + '), stopping batch at row ' + (i + 1));
        break;
      }

      if (i > 0 && delayMs > 0) {
        Utilities.sleep(delayMs);
      }

      var rowData = {};
      for (var k in row) {
        if (row.hasOwnProperty(k)) rowData[k] = row[k];
      }
      rowData.to = recipient;

      try {
        var preview = builder.preview(rowData);
        var subjectCompiled = builder.subjectStr
          ? Compiler.compile(builder.subjectStr)
          : null;
        var subject = subjectCompiled ? subjectCompiled.render(rowData) : '';

        mailer.send({
          to: recipient,
          subject: subject,
          htmlBody: preview.html,
          plainBody: preview.text,
          from: builder.fromAddr || __MeowMailConfig.defaultFrom,
          replyTo: builder.replyToAddr || __MeowMailConfig.defaultReplyTo
        });

        sent++;
        if (onSuccess) onSuccess(row);
      } catch (e) {
        failed++;
        errors.push({ row: row, error: e });
        if (onError) onError(row, e);
      }
    }

    return {
      sent: sent,
      failed: failed,
      total: capped,
      errors: errors,
      summary: { success: sent, failed: failed }
    };
  };

  return BatchSender;
})();
