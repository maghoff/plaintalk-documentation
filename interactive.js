function installInteractive() {

	var elements = document.querySelectorAll(".interactive");
	for (var i = 0; i < elements.length; ++i) (function () {
		var server = new DemoServer();
		var terminal = new Terminal(elements[i]);
		terminal.on('data', function (data) { server.send(data); });
		server.on('data', function (data) { terminal.write('from-server', data); });
	}());
}


if (document.readyState == "complete" || document.readyState == "loaded") {
	installInteractive();
} else {
	document.addEventListener("DOMContentLoaded", installInteractive);
}
