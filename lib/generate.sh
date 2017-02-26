#!/usr/bin/env bash

# Adapted from http://stackoverflow.com/a/4774063
pushd `dirname $0` > /dev/null
THISDIR=`pwd`
popd > /dev/null

PARENTDIR="$(dirname "$THISDIR")"
PUBLICDIR="$PARENTDIR/public"
BUILDDIR="$PARENTDIR/build"

# Copy all static files from the public directory to the build directory
rm -rf $BUILDDIR
cp -r $PUBLICDIR $BUILDDIR
