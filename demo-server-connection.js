var hints = {
	unicode:
		"I see you sent a message containing non-ASCII characters.\n" +
		"  You are probably wondering how that works. For this demo, all\n" +
		"  the text is transmitted in UTF-8-encoding, and decoded on the\n" +
		"  other end. That works well for this demo, which is limited to\n" +
		"  text, but real protocols often transmit binary data, so it is\n" +
		"  in general not safe to assume that PlainTalk can be decoded as\n" +
		"  UTF-8. It is, however, recommended that text is always UTF-8\n" +
		"  encoded in PlainTalk 😺",
	makeDefinition:
		"Good going! You have successfully read out a definition.\n" +
		"  How about adding a definition of your own?",
	makeMultilineDefinition:
		"You're adding a definition! Awesome! Do you think you\n" +
		"  could add a definition that spans multiple lines?",
	escapedCr:
		"You have sent a message that ended in an escaped CR. For\n" +
		"  this simulated telnet-session, we are using telnet/network/windows\n" +
		"  style line endings: CR LF. This means that if you want to escape\n" +
		"  a newline, you need to calculate two bytes for it. What you have\n" +
		"  now is an escaped CR immediately followed by a normal LF, which\n" +
		"  terminates the message."
};

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
			server.placeholderProgressionAtLeast(1);
		},
		protocol: function (msgId, args, reply) {
			// TODO: Handle protocol negotiation
			reply([msgId, "protocol", "doubletalk"]);
		},
		define: function (msgId, args, reply) {
			if (args.length <= 0 || args.length > 2) {
				reply([msgId, "error", "invalid_arguments", "Usage: <msgid> define <term> [<definition>]\n"+
					"  (Maybe you forgot to escape a space in the definition?)"]);
				return;
			}
			var term = args[0];
			if (args.length === 2) {
				// No point in helping the user if he can do this on his own:
				server.gaveHint(hints.makeDefinition);

				var hasNewline = args[1].indexOf('\n') !== -1;
				if (!server.hasGivenHint(hints.makeMultilineDefinition)) {
					if (!hasNewline) {
						reply(['*', 'hint', hints.makeMultilineDefinition]);
						server.gaveHint(hints.makeMultilineDefinition);
					}
				}

				server.define(term, args[1]);
				reply([msgId, "ok"]);
				server.placeholderProgressionAtLeast(3);
				return;
			}
			if (!server.hasDefinition(term)) {
				reply([msgId, "error", "not_found", term]);
				return;
			}

			if (!server.hasGivenHint(hints.makeDefinition)) {
				reply(['*', 'hint', hints.makeDefinition]);
				server.gaveHint(hints.makeDefinition);
			}

			reply([msgId, "ok", server.getDefinition(term)]);
			server.placeholderProgressionAtLeast(3);
		},
		list: function (msgId, args, reply) {
			if (args.length !== 0) {
				reply([msgId, "error", "invalid_arguments", "list takes no arguments"]);
				return;
			}
			reply([msgId, "ok"].concat(server.getAllDefinedTerms()));
			server.placeholderProgressionAtLeast(2);
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

		var lastField = rawmsg[rawmsg.length - 1];
		var lastByte = lastField[lastField.length - 1];
		if (lastByte === '\r'.charCodeAt(0) && !server.hasGivenHint(hints.escapedCr)) {
			reply(['*', 'hint', hints.escapedCr]);
			server.gaveHint(hints.escapedCr);
		}

		var msg = rawmsg.map(function (x) { return decoder.decode(x); });

		if (msg.length === 1) {
			reply([msg[0], "error", "missing_command", "Missing command.\n" +
				"All messages should have the structure <message-id> <command> ...\n" +
				"Try: 0 help"]);
			return;
		}

		if (!server.hasGivenHint(hints.unicode)) {
			function messageContainsUnicode(msg) {
				for (var i = 0; i < msg.length; ++i) {
					var field = msg[i];
					for (var j = 0; j < field.length; ++j) {
						if (field[j] > 0x7f) return true;
					}
				}
				return false;
			}
			if (messageContainsUnicode(rawmsg)) {
				reply(['*', 'hint', hints.unicode]);
				server.gaveHint(hints.unicode);
			}
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
