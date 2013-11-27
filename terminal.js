function Terminal(domNode) {
	if (!(this instanceof Terminal)) return new Terminal(domNode);

	this.domNode = domNode;
	this.buffers = {
		'to-server': new TerminalOutputBuilder(),
		'from-server': new TerminalOutputBuilder()
	};

	var input = document.createElement("input");
	input.setAttribute("type", "text");
	input.setAttribute("placeholder", "1 help");

	input.addEventListener("keyup", function (ev) {
		if (ev.keyCode === 13) {
			ev.preventDefault();
			var line = input.value + "\r\n";
			this.write('to-server', line);
			this.emit('data', line);
			input.value = "";
			return;
		}
	}.bind(this), false);

	var message = createMessageElement("to-server");
	message.appendChild(input);
	this.inputLine = message;

	this.domNode.appendChild(message);
	this.domNode.appendChild(document.createTextNode("\n"));

	for (var dir in this.buffers) (function (direction) {
		this.buffers[direction].on('message', function (message) {
			message.classList.add(direction);
			this.appendLine(message);
		}.bind(this));
		this.buffers[direction].on('messageUpdated', function (message) {
			this.domNode.scrollTop = this.domNode.scrollHeight;
		}.bind(this));
	}.bind(this)(dir));
}
Terminal.prototype = Object.create(EventEmitter.prototype);

Terminal.prototype.appendLine = function (line) {
	this.domNode.insertBefore(line, this.inputLine);
	this.domNode.insertBefore(document.createTextNode("\n"), this.inputLine);
};

Terminal.prototype.write = function (direction, data) {
	this.buffers[direction].write(data);
};

function createMessageElement(direction) {
	var span = document.createElement("span");
	span.classList.add("message");
	span.classList.add(direction);
	return span;
}
