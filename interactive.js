function connectTerminalToServer(terminal, server) {
	var connection = new DemoServerConnection(server);

	terminal.on('data', function (data) {
		connection.send(data);
		if (typeof ga !== 'undefined') ga('send', 'event', 'terminal-1', 'sent message');
	});

	connection.on('data', function (data) { terminal.write('from-server', data); });
	connection.on('close', function () {
		connection.removeAllListeners();
		terminal.removeAllListeners();
		terminal.resetConnection();
		connectTerminalToServer(terminal, server);
	});

	var initialMessage = new TextEncoder("utf-8").encode("0 protocol doubletalk\r\n");
	terminal.write("to-server", initialMessage);
	connection.send(initialMessage);
}

// http://stackoverflow.com/a/7557433/2971
function isElementInViewport (el) {
    var rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    );
}

function installInteractive() {
	var elements = document.querySelectorAll(".interactive");
	for (var i = 0; i < elements.length; ++i) {
		var terminal = new Terminal(elements[i]);
		var server = new DemoServer();
		server.on('placeholder', function (terminal, text) {
			terminal.setPlaceholder(text);
		}.bind(this, terminal));
		server.on('achievement', function (terminal, id) {
			terminal.achievementAwarded(id);
			if (typeof ga !== 'undefined') ga('send', 'event', 'terminal-1', 'achievement', id);
		}.bind(this, terminal));
		connectTerminalToServer(terminal, server);
	}

	// Avoid focusing an off-screen element, as this is confusing to the user.
	// Also it would eat up "up" and "down" keys, which are usable for scrolling.
	setTimeout(function () {
		for (var i = 0; i < elements.length; ++i) {
			var e = elements[i];
			if (e.classList.contains("autofocus")) {
				if (isElementInViewport(e)) {
					e.querySelector("input").focus();
				}
			}
		}
	}, 300);
}

function installLinkToTerminal() {
	var elements = document.querySelectorAll("a.link-to-terminal");
	for (var i = 0; i < elements.length; ++i) (function (link) {
		var target = document.querySelector(link.getAttribute("href"));
		link.onclick = function (ev) {
			ev.preventDefault();
			var rect = target.getBoundingClientRect();
			var centery = window.scrollY + rect.top + rect.height / 2;
			window.scrollTo(window.scrollX, centery - window.innerHeight/2);
			target.querySelector("input").focus();
		};
	}(elements[i]));
}

function installStuffInDocument() {
	installInteractive();
	installLinkToTerminal();
}


if (document.readyState == "complete" || document.readyState == "loaded" || document.readyState == "interactive") {
	installStuffInDocument();
} else {
	document.addEventListener("DOMContentLoaded", installStuffInDocument);
}
