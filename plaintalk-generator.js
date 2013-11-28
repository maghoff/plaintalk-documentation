function PlainTalkGenerator() {
	if (!(this instanceof PlainTalkGenerator)) return new PlainTalkGenerator();

	this.state = 'expectStartMessage';

	this.encoder = new TextEncoder("utf-8");
	this.LF = this.encoder.encode('\n');
	this.SP = this.encoder.encode(' ');
}
PlainTalkGenerator.prototype = Object.create(EventEmitter.prototype);

PlainTalkGenerator.prototype.startMessage = function () {
	if (this.state !== 'expectStartMessage') throw new Error("Invalid state");
	this.state = 'expectStartField';
	this.noFields = true;
}

PlainTalkGenerator.prototype.endMessage = function () {
	if (this.state !== 'expectStartField') throw new Error("Invalid state");
	this.emit('data', this.LF);
	this.state = 'expectStartMessage';
}

PlainTalkGenerator.prototype.startField = function () {
	if (this.state !== 'expectStartField') throw new Error("Invalid state");

	if (this.noFields) {
		this.noFields = false;
	} else {
		this.emit('data', this.SP);
	}
	this.state = 'field';
}

PlainTalkGenerator.prototype.endField = function () {
	if (this.state !== 'field') throw new Error("Invalid state");
	this.state = 'expectStartField';
}

PlainTalkGenerator.prototype.fieldData = function (data) {
	if (this.state !== 'field') throw new Error("Invalid state");

	var escape = (data.length === 0) || (data.length > 100) || (findFirstOf(data, " {\r\n") !== data.length);
	if (escape) this.emit('data', this.encoder.encode('{' + data.length + '}'));
	this.emit('data', data);
}
