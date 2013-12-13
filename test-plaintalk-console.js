#!/usr/bin/env node

var fs = require('fs');
this["encoding-indexes"] = {};
eval(fs.readFileSync('encoding.min.js', 'utf-8'));
eval(fs.readFileSync('event-emitter.js', 'utf-8'));
eval(fs.readFileSync('plaintalk.js', 'utf-8'));
eval(fs.readFileSync('buffered-plaintalk.js', 'utf-8'));
eval(fs.readFileSync('plaintalk-generator.js', 'utf-8'));
eval(fs.readFileSync('demo-server.js', 'utf-8'));

var server = new DemoServer();

process.stdin.on('data', function (data) {
	server.send(data.toString('utf-8'));
});
server.on('data', function (data) {
	process.stdout.write(data);
});
