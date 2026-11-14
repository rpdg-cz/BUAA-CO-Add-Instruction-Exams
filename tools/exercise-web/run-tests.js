#!/usr/bin/env node
'use strict';

// Explicit filenames avoid directory-discovery/glob differences across Node
// versions and shells (notably Node 22 and Windows PowerShell).
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const folder = path.join(__dirname, 'test');
const files = fs.readdirSync(folder).filter(name => name.endsWith('.test.js')).sort()
  .map(name => path.join(folder, name));
const result = spawnSync(process.execPath, ['--test', ...files], {
  stdio: 'inherit', windowsHide: true,
});
if (result.error) throw result.error;
process.exitCode = result.status === null ? 1 : result.status;
