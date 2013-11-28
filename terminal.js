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

	var form = document.createElement("form");
	form.appendChild(input);

	var encoder = new TextEncoder("utf-8");
	form.addEventListener("submit", function (ev) {
		ev.preventDefault();
		var line = encoder.encode(input.value + "\r\n");
		this.write('to-server', line);
		this.emit('data', line);
		input.value = "";
	}.bind(this), false);

	var message = createMessageElement("to-server");
	message.appendChild(form);
	this.inputLine = message;

	this.domNode.appendChild(message);
	this.domNode.appendChild(document.createTextNode("\n"));

	var layoutUpdatePending = false;
	var updateLayout = function () {
		this.domNode.scrollTop = this.domNode.scrollHeight;

		var bottom = this.domNode.offsetTop + this.domNode.offsetHeight + 5;
		var viewportBottom = window.scrollY + window.innerHeight;
		if (bottom > viewportBottom) {
			window.scrollTo(window.scrollX, bottom - window.innerHeight);
		}

		layoutUpdatePending = false;
	}.bind(this);

	for (var dir in this.buffers) (function (direction) {
		this.buffers[direction].on('message', function (message) {
			message.classList.add(direction);
			this.appendLine(message);
		}.bind(this));
		this.buffers[direction].on('messageUpdated', function (message) {
			if (!layoutUpdatePending) {
				layoutUpdatePending = true;
				setTimeout(updateLayout, 0);
			}
		}.bind(this));
	}.bind(this)(dir));
}
Terminal.prototype = Object.create(EventEmitter.prototype);

Terminal.prototype.appendLine = function (line) {
	this.domNode.insertBefore(line, this.inputLine);
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
