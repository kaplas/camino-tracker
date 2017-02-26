#!/usr/bin/env bash
set -e  # stop on error

# Adapted from http://stackoverflow.com/a/4774063
pushd `dirname $0` > /dev/null
THISDIR=`pwd`
popd > /dev/null

PARENTDIR="$(dirname "$THISDIR")"
PUBLICDIR="$PARENTDIR/public"
BUILDDIR="$PARENTDIR/build"
LIBDIR="$PARENTDIR/lib"

# Copy all static files from the public directory to the build directory
rm -rf $BUILDDIR
cp -r $PUBLICDIR $BUILDDIR

# Create location file for the frontend app
# echo "window.locationEntries = " > "$BUILDDIR/js/location-data.js"
# node "$LIBDIR/json-content.js" >> "$BUILDDIR/js/location-data.js"

# Copy test data in place instead of generating it
cp "$PARENTDIR/test-data.js" "$BUILDDIR/js/location-data.js"

# Create a secrets files
echo "window.HERE_APP_ID = \"$HERE_APP_ID\";" > "$BUILDDIR/js/secrets.js"
echo "window.HERE_APP_CODE = \"$HERE_APP_CODE\";" >> "$BUILDDIR/js/secrets.js"