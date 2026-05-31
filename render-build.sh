#!/usr/bin/env bash
# exit on error
set -o errexit

npm install

# Install Playwright/Puppeteer dependencies
# This is required for Puppeteer to run on Render's native environment
# Render includes several common libraries, but Chromium needs these specifically.
# See: https://render.com/docs/native-environments#puppeteer-and-playwright

if [[ -z $SKIP_INSTALL_BROWSERS ]]; then
  echo "...Installing Chromium for Puppeteer"
  npx puppeteer install
fi
