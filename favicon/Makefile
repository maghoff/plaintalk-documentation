favicon.ico: favicon.jpg
	convert favicon.jpg -bordercolor white -border 0 \
		\( -clone 0 -resize 16x16 \) \
		\( -clone 0 -resize 32x32 \) \
		-delete 0 -alpha off -colors 256 favicon.ico

favicon.jpg: favicon.svg
	webkit-image-qt favicon.svg > favicon.jpg
