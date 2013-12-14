function DemoServer() {
	if (!(this instanceof DemoServer)) return new DemoServer();

	this.definitions = {
		war: "war is peace",
		freedom: "freedom is slavery",
		ignorance: "ignorance is strength"
	};
}

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
