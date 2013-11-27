function PlainTalk() {
	if (!(this instanceof PlainTalk)) return new PlainTalk();

	this.escapeCount = 0;
	this.escapeCountString = "";
	this.state = this.messageStart;
}
PlainTalk.prototype = Object.create(EventEmitter.prototype);

PlainTalk.prototype.write = function (data) {
	while (data.length) {
		data = this.state.call(this, data);
	}
};

PlainTalk.prototype.messageStart = function (data) {
	this.emit("messageStart");
	this.emit("fieldStart");
	this.state = this.fieldData;
	return data;
};

PlainTalk.prototype.fieldData = function (data) {
	var i = data.search(/[ {\r\n]/);
	if (i > 0) {
		this.emit("fieldData", data.substr(0, i));
		return data.substr(i);
	} else if (i === -1) {
		this.emit("fieldData", data);
		return "";
	}

	var control = data[0];
	if (control === ' ') {
		this.emit("fieldEnd");
		this.emit("fieldStart");
	} else if (control === '\r') {
		this.state = this.expectLineFeed;
	} else if (control === '\n') {
		this.emit("fieldEnd");
		this.emit("messageEnd");
		this.state = this.messageStart;
	} else if (control === '{') {
		this.escapeCount = 0;
		this.escapeCountString = "";
		this.state = this.expectEscapeCount;
	}
	return data.substr(1);
};

PlainTalk.prototype.expectLineFeed = function (data) {
	if (data[0] !== '\n') {
		this.emit("error", new Error("CR must be immediately followed by LF"));
		this.state = this.errorState;
		return data;
	}
	this.emit("fieldEnd");
	this.emit("messageEnd");
	this.state = this.messageStart;
	return data.substr(1);
};

PlainTalk.prototype.expectEscapeCount = function (data) {
	if (!data[0].match(/^[0-9]$/g)) {
		this.state = this.errorState;
		this.emit("error", new Error("Escape count specifier must start with a digit"));
		return data;
	}

	this.state = this.readingEscapeCount;
	return data;
};

PlainTalk.prototype.readingEscapeCount = function (data) {
	var i = data.search('}');
	if (i === 0) {
		this.emit('readEscapeCount', this.escapeCount, this.escapeCountString);
		this.state = this.readingEscapedData;
		return data.substr(1);
	} else if (i === -1) {
		i = data.length;
	}
	var digits = data.substr(0, i);
	if (!digits.match(/^[0-9]+$/g)) {
		this.state = this.errorState;
		this.emit("error", new Error("Invalid byte found within {}. Only decimal digits allowed"));
		return data;
	}

	this.escapeCountString += digits;
	this.escapeCount *= Math.pow(10, i);
	this.escapeCount += Number(digits, 10);
	return data.substr(i);
};

PlainTalk.prototype.readingEscapedData = function (data) {
	var len = Math.min(this.escapeCount, data.length);
	this.emit("fieldData", data.substr(0, len));
	this.escapeCount -= len;
	if (this.escapeCount === 0) this.state = this.fieldData;
	return data.substr(len);
};

PlainTalk.prototype.errorState = function (data) {
	return "";
};
