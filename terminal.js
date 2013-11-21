function Terminal(domNode) {
	if (!(this instanceof Terminal)) return new Terminal(domNode);

	this.domNode = domNode;
	this.buffers = { 'to-server': "", 'from-server': "" };

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
}
Terminal.prototype = Object.create(EventEmitter.prototype);

Terminal.prototype.appendLine = function (line) {
	this.domNode.insertBefore(line, this.inputLine);
	this.domNode.insertBefore(document.createTextNode("\n"), this.inputLine);
};

Terminal.prototype.write = function (direction, data) {
	this.buffers[direction] += data;
	var lines = this.buffers[direction].split(/\r?\n/);
	this.buffers[direction] = lines.pop();

	lines.forEach(function (line) {
		var message = createMessageElement(direction);
		message.textContent = line;
		this.appendLine(message);

		this.domNode.scrollTop = this.domNode.scrollHeight;
	}.bind(this));
};

function createMessageElement(direction) {
	var span = document.createElement("span");
	span.classList.add("message");
	span.classList.add(direction);
	return span;
}
