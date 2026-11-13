#!/bin/sh
# Runs the browser tests in the container CI uses, so screenshots come out
# the same as they do there. Needs Docker, and `npm run build` first.
#
#   npm run test:browser:linux                               run everything
#   npm run test:browser:linux -- stories --update-snapshots retake the story screenshots
#
# CI runs on Intel-type processors. The container is run as that type here
# too (emulated on an Apple Silicon Mac), because the same page comes out a
# few pixels different on another type of processor.
set -eu

version=$(node -p "require('./node_modules/@playwright/test/package.json').version")

exec docker run --rm --ipc=host --platform linux/amd64 \
  -v "$PWD":/work -w /work \
  "mcr.microsoft.com/playwright:v${version}-noble" \
  npx playwright test "$@"
