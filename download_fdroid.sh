#!/bin/bash

# Base URL of the source F-Droid repository
BASE_URL="https://mirror.accum.se/mirror/divestos.org/divestos-apks/official/fdroid/repo"

# Directories to store downloaded content
mkdir -p repo/apks repo/metadata repo/icons

# Download APKs
wget -r -np -nH --cut-dirs=1 -A "*.apk" -P repo/apks ${BASE_URL}

# Download Metadata (index-v1.json)
wget -O repo/index-v1.json ${BASE_URL}/index-v1.json

# Parse the index-v1.json to download icons and metadata files
jq -r '.apps[] | .packageName as $pkg | .suggestedVersionCode as $ver | select(.icon | length > 0) | "${pkg}_${ver}.txt"' repo/index-v1.json | \
while read -r metadata_file; do
    wget -O repo/metadata/${metadata_file} ${BASE_URL}/${metadata_file}
done

jq -r '.apps[] | .packageName as $pkg | .suggestedVersionCode as $ver | select(.icon | length > 0) | "${pkg}_${ver}.png"' repo/index-v1.json | \
while read -r icon_file; do
    wget -O repo/icons/${icon_file} ${BASE_URL}/${icon_file}
done

