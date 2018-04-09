#!/usr/bin/env bash
npm run-script build
FRONT_TEST_KEYS="`node test/encode_keys.js test/creds.json`" npm test
