#!/bin/sh
# Сборка server.jar (fastcgi-lib встраивается внутрь).
set -e
cd "$(dirname "$0")"
rm -rf build && mkdir -p build/classes
javac --release 17 -cp lib/fastcgi-lib.jar -d build/classes src/pointchecker/*.java
(cd build/classes && jar xf ../../lib/fastcgi-lib.jar com)
jar cfe build/server.jar pointchecker.Main -C build/classes .
echo "build/server.jar"
