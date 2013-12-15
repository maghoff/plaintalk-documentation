function BufferedPlaintalk(plaintalk) {
	if (!(this instanceof BufferedPlaintalk)) return new BufferedPlaintalk(plaintalk);

	plaintalk.on('messageStart', function () {
		this.fields = [];
	}.bind(this));
	plaintalk.on('messageEnd', function () {
		this.emit('message', this.fields);
		this.fields = null;
	}.bind(this));

	var readingField, totalLength;
	plaintalk.on('fieldStart', function () {
		readingField = [];
		totalLength = 0;
	}.bind(this));
	plaintalk.on('fieldData', function (data) {
		readingField.push(data);
		totalLength += data.length;
	}.bind(this));
	plaintalk.on('fieldEnd', function () {
		var field = new Uint8Array(totalLength);
		var pos = 0;
		for (var i = 0; i < readingField.length; ++i) {
			field.set(readingField[i], pos);
			pos += readingField[i].length;
		}
		this.fields.push(field);
	}.bind(this));

	plaintalk.on('error', function (errId, desc) {
		this.emit('error', errId, desc);
	}.bind(this));
}
BufferedPlaintalk.prototype = Object.create(EventEmitter.prototype);
