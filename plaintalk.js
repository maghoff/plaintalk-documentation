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

function findFirstOf(data, chars) {
	var nums = [];
	var i, j;

	for (i = 0; i < chars.length; ++i) nums.push(chars.charCodeAt(i) & 0xFF);

	for (i = 0; i < data.length; ++i) {
		var char = data[i];
		for (j = 0; j < nums.length; ++j) {
			if (char === nums[j]) return i;
		}
	}

	return data.length;
}

PlainTalk.prototype.fieldData = function (data) {
	var i = findFirstOf(data, " {\r\n");
	if (i > 0) {
		this.emit("fieldData", data.subarray(0, i));
		return data.subarray(i);
	}

	var control = String.fromCharCode(data[0]);
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
		this.state = this.readingEscapeCount;
	}
	return data.subarray(1);
};

PlainTalk.prototype.expectLineFeed = function (data) {
	if (data[0] !== '\n'.charCodeAt(0)) {
		this.emit("error", "crlf", "CR must be immediately followed by LF");
		this.state = this.errorState;
		return data;
	}
	this.emit("fieldEnd");
	this.emit("messageEnd");
	this.state = this.messageStart;
	return data.subarray(1);
};

PlainTalk.prototype.readingEscapeCount = function (data) {
	if (data[0] === '}'.charCodeAt(0)) {
		this.emit('readEscapeCount', this.escapeCount, this.escapeCountString);
		this.state = this.readingEscapedData;
		return data.subarray(1);
	}

	var i = 0;
	while (data[i] >= '0'.charCodeAt(0) && data[i] <= '9'.charCodeAt(0)) {
		var digit = String.fromCharCode(data[i]);
		this.escapeCountString += digit;
		this.escapeCount *= 10;
		this.escapeCount += Number(digit, 10);
		i++;

		if (this.escapeCount > 1000) {
			this.state = this.errorState;
			this.emit("error", "escape-overflow", "I'm sure you did not want to escape more than 1000 bytes");
			this.emit("ignored", new TextEncoder("utf-8").encode("{" + this.escapeCountString));
			return data.subarray(i);
		}
	}

	if (i === 0) {
		this.state = this.errorState;
		this.emit("error", "escape-invalid", "Invalid byte found within {}. Only decimal digits allowed");
		this.emit("ignored", new TextEncoder("utf-8").encode("{" + this.escapeCountString));
		return data;
	}

	return data.subarray(i);
};

PlainTalk.prototype.readingEscapedData = function (data) {
	var len = Math.min(this.escapeCount, data.length);
	this.emit("fieldData", data.subarray(0, len));
	this.escapeCount -= len;
	if (this.escapeCount === 0) this.state = this.fieldData;
	return data.subarray(len);
};

PlainTalk.prototype.errorState = function (data) {
	this.emit("ignored", data);
	return data.subarray(data.length);
};
