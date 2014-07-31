"use strict";

var fs = require("fs");
var path = require("path");

var interfacefiles = fs.readdirSync(path.join(__dirname, "interfaces"))
var interfaces_raw = [];
var interfaces = {};
interfacefiles.forEach(function(iffile){
	var filename = path.join(__dirname, "interfaces", iffile);
	if (fs.statSync(filename).isFile()) {
		var interf = require(filename);
		interfaces_raw.push(interf);
	} 
});

console.log("[io] Loaded interfaces");

module.exports = function InputOutputInterfaces (api) {
	require("events").EventEmitter.call(this);
	this.send = function (message) {
		var interf;
		if (interfaces.idOf(data.interface)) {
			interf = data.interface;
		} else {
			interf = interfaces[data.interface] || api.io.defaultInterface;
		}
		interf.send(message);
	}

	interfaces_raw.forEach(function(interf) {
		var inf = new interf(api);
		interfaces[inf.name] = inf;
	});

	console.log('[io] Started interfaces');

	this.defaultInterface = interfaces["browser/1"];
}