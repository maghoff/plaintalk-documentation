function EventEmitter() {
	if (!(this instanceof EventEmitter)) return new EventEmitter();
}

EventEmitter.prototype.on = function (event, listener) {
	this.listeners = this.listeners || {};
	this.listeners[event] = this.listeners[event] || [];
	this.listeners[event].push(listener);
};

EventEmitter.prototype.removeAllListeners = function () {
	this.listeners = {};
};

EventEmitter.prototype.emit = function (event) {
	var args = Array.prototype.slice.call(arguments, 1);
	((this.listeners || {})[event] || []).forEach(function (listener) {
		listener.apply(null, args);
	});
};
