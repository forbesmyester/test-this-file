#!/usr/bin/env node

/* global process */
var args = process.argv.slice(2);
var fs = require('fs');

var output = function(str) {
	"use strict";
	/* global console */
	console.log(str);
};

var map = function(f, ar) {
	"use strict";
	var r = [], i;
	for (i=0; i<ar.length; i++) {
		r.push(f(ar));
	}
	return r;
};

var replaceFilename = function(filename, arg) {
	"use strict";
	if (arg == '[FILENAME]') {
		return filename;
	}
	return arg;
};

var runCommand = function(cmdSpec, filename, next) {
	"use strict";
	var cmd = map(
			replaceFilename.bind(this, filename),
			cmdSpec.args
		),
		passthru = require('passthru');

	cmd.unshift(cmdSpec.cmd);
	passthru(cmd, next);
};

if (!args.length) {
	output('No file specified');
	return;
}

var settings = [],
	i = 0;
try {
	settings = JSON.parse(fs.readFileSync('./.test-methods.json').toString());
} catch (e) {
	console.log(e);
	output('Could not load any settings');
	process.exit(1);
}

for (i=0; i<settings.length; i++) {
	if ((new RegExp(settings[i].pattern)).test(args[0])) {
		runCommand(settings[i].command, args[0], function(err) {
			process.exit(err);
		});
		return;
	}
}

output("Could not find a way to test '" + args[0] + "'");
process.exit(1);
