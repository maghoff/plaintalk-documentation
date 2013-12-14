function DemoServerConnection(server) {
	if (!(this instanceof DemoServerConnection)) return new DemoServerConnection();

	this.protocol = new PlainTalk();

	var buffered = new BufferedPlaintalk(this.protocol);

	var encoder = new TextEncoder("utf-8");
	function reply0r(generator, message) {
		generator.startMessage();
		message.forEach(function (field) {
			generator.startField();
			generator.fieldData(encoder.encode(field));
			generator.endField();
		});
		generator.endMessage();
	}

	var generator = new PlainTalkGenerator();
	generator.on('data', function (data) { this.emit('data', data); }.bind(this));

	var reply = reply0r.bind(this, generator);

	var commands = {
		help: function (msgId, args, reply) {
			if (args.length !== 0) {
				reply([msgId, "error", "invalid_arguments", "help takes no arguments"]);
				return;
			}
			reply([msgId, "ok",
				"The following commands are available:\n" +
				"  help                       Get this help\n" +
				"  list                       List all the terms that have a definition\n" +
				"  define <term>              Read the definition of the given term\n" +
				"  define <term> <definition> Supply a definition for the given term"
			]);
		},
		protocol: function (msgId, args, reply) {
			// TODO: Handle protocol negotiation
			reply([msgId, "protocol", "doubletalk"]);
		},
		define: function (msgId, args, reply) {
			if (args.length <= 0 || args.length > 2) {
				reply([msgId, "error", "invalid_arguments", "Usage: <msgid> define <term> [<definition>]"]);
				return;
			}
			var term = args[0];
			if (args.length === 2) {
				server.define(term, args[1]);
				reply([msgId, "ok"]);
				return;
			}
			if (!server.hasDefinition(term)) {
				reply([msgId, "error", "not_found", term]);
				return;
			}
			reply([msgId, "ok", server.getDefinition(term)]);
		},
		list: function (msgId, args, reply) {
			if (args.length !== 0) {
				reply([msgId, "error", "invalid_arguments", "list takes no arguments"]);
				return;
			}
			reply([msgId, "ok"].concat(server.getAllDefinedTerms()));
		}
	};

	var decoder = new TextDecoder("utf-8");
	buffered.on('error', function (err) {
		reply(["*", "error", "protocol_error", "PlainTalk parser reported:\n" + err.toString()]);
		this.emit("close");
	}.bind(this));

	buffered.on('message', function (rawmsg) {
		if (!rawmsg.length) return;
		if (rawmsg.length === 1 && !rawmsg[0].length) return;

		var msg = rawmsg.map(function (x) { return decoder.decode(x); });

		if (msg.length === 1) {
			reply([msg[0], "error", "missing_command", "Missing command.\n" +
				"All messages should have the structure <message-id> <command> ...\n" +
				"Try: 0 help"]);
			return;
		}

		var msgId = msg[0];
		var command = msg[1];

		if (!commands.hasOwnProperty(command)) {
			reply([msgId, 'error', 'unknown_command', command]);
			return;
		}

		commands[command](msgId, msg.slice(2), reply);
	});
}
DemoServerConnection.prototype = Object.create(EventEmitter.prototype);

DemoServerConnection.prototype.send = function (data) {
	this.protocol.write(data);
};
