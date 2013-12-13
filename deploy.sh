#!/bin/bash -e

S3_TARGET="s3://magnushoff.com/plaintalk/"

rm -rf deploy
mkdir deploy

for x in *.js *.html *.css *.ico font/*
do
	mkdir -p "$(dirname "deploy/$x")"
	gzip --best --stdout "$x" > "deploy/$x"
done

s3cmd sync \
	--guess-mime-type \
	--cf-invalidate \
	--delete-removed \
	--add-header "Content-Encoding: gzip" \
	"deploy" "$S3_TARGET"
