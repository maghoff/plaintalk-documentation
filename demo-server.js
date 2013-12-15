var placeholders = [
	"1 help",
	"2 list",
	"3 define ignorance",
	""
];

function DemoServer() {
	if (!(this instanceof DemoServer)) return new DemoServer();

	this.definitions = {
		war: "war is peace",
		freedom: "freedom is slavery",
		ignorance: "ignorance is strength"
	};
	this.givenHints = {};
	this.placeholderProgression = 0;
}
DemoServer.prototype = Object.create(EventEmitter.prototype);

DemoServer.prototype.define = function (term, definition) {
	this.definitions[term] = definition;
};

DemoServer.prototype.hasDefinition = function (term) {
	return this.definitions.hasOwnProperty(term);
};

DemoServer.prototype.getDefinition = function (term) {
	return this.definitions[term];
};

DemoServer.prototype.getAllDefinedTerms = function () {
	return Object.keys(this.definitions);
};

DemoServer.prototype.hasGivenHint = function (hint) {
	return this.givenHints.hasOwnProperty(hint);
};

DemoServer.prototype.gaveHint = function (hint) {
	this.givenHints[hint] = true;
};

DemoServer.prototype.placeholderProgressionAtLeast = function (stage) {
	if (stage > this.placeholderProgression) {
		this.placeholderProgression = stage;
		this.emit("placeholder", placeholders[stage]);
	}
};
