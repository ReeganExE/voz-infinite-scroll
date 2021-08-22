#!/usr/bin/env bash

npm install

tsc --target es2020 --module commonjs --outDir dist --esModuleInterop --skipLibCheck --noImplicitUseStrict src/*.ts

export RELEASE_VERSION=${GITHUB_REF#refs/*/v}
grep -vw \
  -e "/* eslint-disable" \
  -e 'eslint-disable-next-line' \
  -e 'Object.defineProperty(exports, "__esModule"' \
  dist/infinitie-scroll.js | envsubst >voz-infinitie-scroll.js
