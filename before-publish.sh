#!/bin/sh

echo "$(jq '.files |= ["./*"]' pkg/package.json)" > pkg/package.json
