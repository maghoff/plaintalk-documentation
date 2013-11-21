function BufferedPlaintalk(plaintalk) {
	if (!(this instanceof BufferedPlaintalk)) return new BufferedPlaintalk(plaintalk);

	plaintalk.on('messageStart', function () {
		this.fields = [];
	}.bind(this));
	plaintalk.on('messageEnd', function () {
		this.emit('message', this.fields);
		this.fields = null;
	}.bind(this));

	plaintalk.on('fieldStart', function () {
		this.fields.push("");
	}.bind(this));
	plaintalk.on('fieldData', function (data) {
		this.fields[this.fields.length - 1] += data;
	}.bind(this));
	plaintalk.on('fieldEnd', function () { }.bind(this));

	plaintalk.on('error', function (err) {
		this.emit('error', err);
	}.bind(this));
}
BufferedPlaintalk.prototype = Object.create(EventEmitter.prototype);
