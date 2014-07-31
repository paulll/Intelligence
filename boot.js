"use strict";

global.Sync = require('sync');

var fs = require("fs");
var exec = require("child_process").exec;
var path = require("path");

global.DEBUG = true;

console.log("v5.2 dev, loading");
console.log("Current timestamp:", Date.now());

// make symlinks

var npmmods = path.join(__dirname,'node_modules');

function recursiveSymlinks(dir) {
	var containing = fs.readdirSync(dir);
	if ( dir !== './modules' ) {
		try {
			// @magick;
			var dest = path.join(__dirname, dir);
			var offset = path.relative(dest, npmmods);
			var trulyDest = path.join(dest, 'node_modules');
			fs.symlinkSync(offset, trulyDest, 'dir');
		} catch (e) {
			// already created;
		}
	}
	containing.forEach(function(a) {
		var dst = path.join(dir, a);
		if (fs.lstatSync(dst).isDirectory()) {
			recursiveSymlinks(dst);
		}
	});
}

recursiveSymlinks('./modules')

console.log('Created symlinks to node_modules');

// load modules

var modules = fs.readdirSync("modules");
global.api = {};

modules.forEach(function(themodule, i){
	if (!fs.statSync('./modules/'+themodule).isDirectory()) {return false;} 
	try {
		var mf = JSON.parse(fs.readfileSync("modules/"+themodule+"/manifest.json"));
	} catch (e) {
		console.log("[WARN] no manifest found in dir ./modules/"+themodule);
		var mf = {};
	}
	try {
		api[themodule] = require("./modules/"+themodule+"/"+(mf.main||"index.js"));
	} catch (e) {
		if (DEBUG) {
			throw e;
		}
		if (mf.important) {
			console.log('[FATAL] important module "%s" failed to load', mf.name||themodule);
			process.exit(0);
		} else {
			console.log('[WARN] module "%s" failed to load', mf.name||themodule);
		}
	}
	if (i == modules.length-1) {
		for (var thenmodule in api) {
			try {
				api[thenmodule] = new api[thenmodule];
			} catch (e) {
				if (DEBUG) {
					throw e;
				}
				if (mf.important) {
					console.log('[FATAL] important module "%s" failed to start', mf.name||thenmodule);
					process.exit(0);
				} else {
					console.log('[WARN] module "%s" failed to start', mf.name||thenmodule);
				}
			}
		}
		console.log("System initialized.");
	}
});
