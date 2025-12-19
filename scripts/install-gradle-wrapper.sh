#!/usr/bin/env bash
set -euo pipefail

VERSION=${1:-8.9}
DIST=gradle-${VERSION}-all
URL="https://services.gradle.org/distributions/${DIST}.zip"
DEST_DIR="$(pwd)/android/gradle/wrapper/dists/${DIST}"

echo "Installing Gradle distribution ${DIST} into ${DEST_DIR}"
mkdir -p "${DEST_DIR}"
TMPZIP=$(mktemp)

echo "Downloading ${URL} ..."
if command -v curl >/dev/null 2>&1; then
  curl -fSL "${URL}" -o "${TMPZIP}"
elif command -v wget >/dev/null 2>&1; then
  wget -O "${TMPZIP}" "${URL}"
else
  echo "Error: curl or wget required to download Gradle distribution" >&2
  exit 1
fi

echo "Unpacking..."
unzip -o "${TMPZIP}" -d "${DEST_DIR}"
rm -f "${TMPZIP}"

echo "Gradle ${VERSION} installed to ${DEST_DIR}"

echo "You can now run: cd android && ./gradlew clean assembleRelease"