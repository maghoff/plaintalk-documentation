function connectTerminalToServer(terminal, server) {
	var connection = new DemoServerConnection(server);

	terminal.on('data', function (data) { connection.send(data); });
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
		}.bind(this, terminal));
		connectTerminalToServer(terminal, server);
	}
}


if (document.readyState == "complete" || document.readyState == "loaded" || document.readyState == "interactive") {
	installInteractive();
} else {
	document.addEventListener("DOMContentLoaded", installInteractive);
}
