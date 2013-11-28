function TerminalOutputBuilder() {
	if (!(this instanceof TerminalOutputBuilder)) return new TerminalOutputBuilder();

	this.buffer = null;
	this.field = null;
	this.zeroFields = true;
	this.plaintalk = new PlainTalk();

	this.plaintalk.on('messageStart', function () {
		this.buffer = document.createElement("span");
		this.buffer.classList.add("message");
		this.emit('message', this.buffer);
		this.zeroFields = true;
		this.emit('messageUpdated');
	}.bind(this));

	this.plaintalk.on('messageEnd', function () {
		this.buffer.appendChild(document.createTextNode("\n"));
		this.emit('messageUpdated');
		this.buffer = null;
	}.bind(this));

	this.plaintalk.on('fieldStart', function () {
		if (!this.zeroFields) {
			this.buffer.appendChild(document.createTextNode(" "));
		}
		this.zeroFields = false;

		this.field = document.createElement("span");
		this.field.classList.add("field");
		this.buffer.appendChild(this.field);
		this.emit('messageUpdated');
	}.bind(this));

	this.plaintalk.on('fieldEnd', function () {
		this.field = null;
	}.bind(this));

	var decoder = new TextDecoder("utf-8");
	this.plaintalk.on('fieldData', function (data) {
		var text = decoder.decode(data);
		this.field.appendChild(document.createTextNode(text));
		this.emit('messageUpdated');
	}.bind(this));

	this.plaintalk.on('readEscapeCount', function (count, countString) {
		var escape = document.createElement("span");
		escape.classList.add("control");
		escape.textContent = "{" + countString + "}";
		this.field.appendChild(escape);
		this.emit('messageUpdated');
	}.bind(this));
}
TerminalOutputBuilder.prototype = Object.create(EventEmitter.prototype);

TerminalOutputBuilder.prototype.write = function (data) {
	this.plaintalk.write(data);
}
