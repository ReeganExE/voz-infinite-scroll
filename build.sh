#!/usr/bin/env bash

tsc --target es2020 --module commonjs --outDir dist --esModuleInterop --skipLibCheck --noImplicitUseStrict src/*.ts

export RELEASE_VERSION=${GITHUB_REF#refs/*/v}

cat <<EOF >voz-infinitie-scroll.js
// ==UserScript==
// @name         Infinite Scroll VOZ
// @namespace    https://voz.vn
// @version      ${RELEASE_VERSION}.${RUN_ID}
// @description  Infinite Scroll VOZ - Lướt voz.vn nhanh gọn như lướt facebook. https://github.com/ReeganExE/voz-infinite-scroll
// @author       Ninh Pham (ReeganExE), Nguyen Duy Tiep (green-leaves)
// @match        https://voz.vn/t/*
// @grant        GM_addStyle
// ==/UserScript==

EOF

grep -vw \
  -e "/* eslint-disable" \
  -e 'eslint-disable-next-line' \
  -e 'Object.defineProperty(exports, "__esModule"' \
  dist/infinitie-scroll.js >>voz-infinitie-scroll.js
