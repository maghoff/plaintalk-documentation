function Terminal(domNode) {
	if (!(this instanceof Terminal)) return new Terminal(domNode);

	this.domNode = domNode;

	var input = this.input = document.createElement("input");
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

		layoutUpdatePending = false;
		if (document.activeElement !== this.input) return;

		var bottom = this.domNode.offsetTop + this.domNode.offsetHeight + 5;
		var viewportBottom = window.scrollY + window.innerHeight;
		if (bottom > viewportBottom) {
			window.scrollTo(window.scrollX, bottom - window.innerHeight);
		}

		layoutUpdatePending = false;
	}.bind(this);

	this.buffers = {
		'to-server': new TerminalOutputBuilder(),
		'from-server': new TerminalOutputBuilder()
	};
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

Terminal.prototype.resetConnection = function () {
	var layoutUpdatePending = false;
	var updateLayout = function () {
		this.domNode.scrollTop = this.domNode.scrollHeight;

		layoutUpdatePending = false;
		if (document.activeElement !== this.input) return;

		var bottom = this.domNode.offsetTop + this.domNode.offsetHeight + 5;
		var viewportBottom = window.scrollY + window.innerHeight;
		if (bottom > viewportBottom) {
			window.scrollTo(window.scrollX, bottom - window.innerHeight);
		}
	}.bind(this);
	this.buffers = {
		'to-server': new TerminalOutputBuilder(),
		'from-server': new TerminalOutputBuilder()
	};
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

	var bar = document.createElement("div");
	bar.classList.add("connection-broken");
	bar.textContent = "Connection reset\n";
	this.appendLine(bar);

	if (!layoutUpdatePending) {
		layoutUpdatePending = true;
		setTimeout(updateLayout, 0);
	}
};

Terminal.prototype.setPlaceholder = function (text) {
	this.input.setAttribute("placeholder", text);
};

var achievements = [
	"Nqqrq n zhygvyvar qrsvavgvba",
	"Perngrq na vainyvq rfpncr frdhrapr",
	"Gevttrerq na biresybj va na rfpncr frdhrapr"
];

function ROT13(str) {
	var res = "";
	for (var i = 0; i < str.length; ++i) {
		var c = str.charCodeAt(i);
		if (('a'.charCodeAt(0) <= c) && (c < ('a'.charCodeAt(0) + 13))) {
			res += String.fromCharCode(c + 13);
		} else if ((('a'.charCodeAt(0) + 13) <= c) && (c <= 'z'.charCodeAt(0))) {
			res += String.fromCharCode(c - 13);
		} else if (('A'.charCodeAt(0) <= c) && (c < ('A'.charCodeAt(0) + 13))) {
			res += String.fromCharCode(c + 13);
		} else if ((('A'.charCodeAt(0) + 13) <= c) && (c <= 'Z'.charCodeAt(0))) {
			res += String.fromCharCode(c - 13);
		} else {
			res += str[i];
		}
	}
	return res;
}

Terminal.prototype.acquireAchievementsDOM = function () {
	if (this.achievements) return;

	this.achievements = document.createElement("div");
	this.achievements.classList.add("achievements");
	for (var i = 0; i < achievements.length; ++i) {
		var star = document.createElement("span");
		star.classList.add("star");
		star.textContent = "☆";
		this.achievements.appendChild(star);
	}

	this.achievementsMessage = document.createElement("div");
	this.achievementsMessage.classList.add("achievementsMessage");
	this.achievementsMessage.classList.add("highlighted");
	this.achievementsMessage.style.display = "none";

	this.domNode.parentNode.appendChild(this.achievements);
	this.domNode.parentNode.appendChild(this.achievementsMessage);
};

Terminal.prototype.achievementAwarded = function (id) {
	this.acquireAchievementsDOM();

	var star = this.achievements.querySelectorAll(".star")[id];
	star.textContent = "★";
	star.setAttribute("title", ROT13(achievements[id]));
	var popup = installPopup(star);
	applyPopupEventHandlers(star, popup);

	this.achievementsMessage.classList.add("new");
	this.achievementsMessage.style.display = "block";
	this.achievementsMessage.textContent = "Achievement awarded: " + ROT13(achievements[id]);
	setTimeout(function () {
		this.achievementsMessage.classList.remove("new");
	}.bind(this), 0);
	setTimeout(function () {
		this.achievementsMessage.style.display = "none";
	}.bind(this), 5000);
};

function createMessageElement(direction) {
	var span = document.createElement("span");
	span.classList.add("message");
	span.classList.add(direction);
	return span;
}
