'use strict';
/* eslint-env mocha */
var assert = require('assert');
var spawn = require('child_process').spawn;

var bin = require.resolve('pug-lint/bin/pug-lint');

function run(args, cb) {
  var command = [bin].concat(args);
  var stdout = '';
  var stderr = '';
  var node = process.execPath;
  var child = spawn(node, command);

  if (child.stderr) {
    child.stderr.on('data', function (chunk) {
      stderr += chunk;
    });
  }

  if (child.stdout) {
    child.stdout.on('data', function (chunk) {
      stdout += chunk;
    });
  }

  child.on('error', cb);

  child.on('close', function (code) {
    cb(null, code, stdout, stderr);
  });

  return child;
}

it('should be used by pug-lint', function (done) {
  var args = ['-r', './', 'fixture.pug'];

  run(args, function (err, code, stdout) {
    assert(!err, err);
    assert.equal(stdout.indexOf('##teamcity') !== -1, true, stdout);
    done();
  });
});
