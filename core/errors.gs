function MeowMailError(message) {
  this.name = 'MeowMailError';
  this.message = message || '';
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, MeowMailError);
  }
}
MeowMailError.prototype = Object.create(Error.prototype);
MeowMailError.prototype.constructor = MeowMailError;

function TemplateError(message) {
  this.name = 'TemplateError';
  this.message = message || '';
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, TemplateError);
  }
}
TemplateError.prototype = Object.create(MeowMailError.prototype);
TemplateError.prototype.constructor = TemplateError;

function RenderError(message) {
  this.name = 'RenderError';
  this.message = message || '';
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, RenderError);
  }
}
RenderError.prototype = Object.create(MeowMailError.prototype);
RenderError.prototype.constructor = RenderError;

function SendError(message) {
  this.name = 'SendError';
  this.message = message || '';
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, SendError);
  }
}
SendError.prototype = Object.create(MeowMailError.prototype);
SendError.prototype.constructor = SendError;
