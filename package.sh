#!/bin/bash

set -e

FILES="*.js *.html *.css *.ico font/*"

tar -zc --transform 's,^,plaintalk/,' -fplaintalk.tar.xz $FILES
