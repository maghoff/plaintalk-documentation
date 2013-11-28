function DemoServer() {
	if (!(this instanceof DemoServer)) return new DemoServer();

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

	var definitions = {
		war: "war is peace",
		freedom: "freedom is slavery",
		ignorance: "ignorance is strength"
	};

	var commands = {
		help: function (msgId, args, reply) {
			if (args.length !== 0) {
				reply([msgId, "error", "wrong_arguments", "help takes no arguments"]);
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
		define: function (msgId, args, reply) {
			if (args.length <= 0 || args.length > 2) {
				reply([msgId, "error", "wrong_arguments", "Usage: <msgid> define <term> [<definition>]"]);
				return;
			}
			var term = args[0];
			if (args.length === 2) {
				definitions[term] = args[1];
				reply([msgId, "ok"]);
				return;
			}
			if (!definitions.hasOwnProperty(term)) {
				reply([msgId, "error", "not_found", term]);
				return;
			}
			reply([msgId, "ok", definitions[term]]);
		},
		list: function (msgId, args, reply) {
			if (args.length !== 0) {
				reply([msgId, "error", "wrong_arguments", "list takes no arguments"]);
				return;
			}
			var terms = [];
			for (var item in definitions) terms.push(item);
			reply([msgId, "ok"].concat(terms));
		}
	};

	var decoder = new TextDecoder("utf-8");
	buffered.on('error', function (err) { throw err; });
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
			reply([msgId, 'error', 'not_found', command]);
			return;
		}

		commands[command](msgId, msg.slice(2), reply);
	});
}
DemoServer.prototype = Object.create(EventEmitter.prototype);

DemoServer.prototype.send = function (data) {
	this.protocol.write(data);
};
