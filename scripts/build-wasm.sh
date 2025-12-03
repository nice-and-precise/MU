#!/bin/bash
cd src/lib/drilling/core-rs
wasm-pack build --target web --out-dir ../../../public/wasm
