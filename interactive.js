function connectTerminalToNewServer(terminal) {
	var server = new DemoServer();
	terminal.on('data', function (data) { server.send(data); });
	server.on('data', function (data) { terminal.write('from-server', data); });
	server.on('close', function () {
		server.removeAllListeners();
		terminal.removeAllListeners();
		terminal.resetConnection();
		connectTerminalToNewServer(terminal);
	});

	var initialMessage = new TextEncoder("utf-8").encode("0 protocol doubletalk\r\n");
	terminal.write("to-server", initialMessage);
	server.send(initialMessage);
}

function installInteractive() {
	var elements = document.querySelectorAll(".interactive");
	for (var i = 0; i < elements.length; ++i) connectTerminalToNewServer(new Terminal(elements[i]));
}


if (document.readyState == "complete" || document.readyState == "loaded" || document.readyState == "interactive") {
	installInteractive();
} else {
	document.addEventListener("DOMContentLoaded", installInteractive);
}
