// deno-fmt-ignore-file
// deno-lint-ignore-file

// Copyright Joyent and Node contributors. All rights reserved. MIT license.
// Taken from Node 16.13.0
// This file is automatically generated by "node/_tools/setup.ts". Do not modify this file manually

'use strict';
const common = require('../common');
const assert = require('assert');
const net = require('net');

{
  // Test bad signal.
  const server = net.createServer();
  assert.throws(
    () => server.listen({ port: 0, signal: 'INVALID_SIGNAL' }),
    {
      code: 'ERR_INVALID_ARG_TYPE',
      name: 'TypeError'
    });
}

{
  // Test close.
  const server = net.createServer();
  const controller = new AbortController();
  server.on('close', common.mustCall());
  server.listen({ port: 0, signal: controller.signal });
  controller.abort();
}

{
  // Test close with pre-aborted signal.
  const server = net.createServer();
  const signal = AbortSignal.abort();
  server.on('close', common.mustCall());
  server.listen({ port: 0, signal });
}
