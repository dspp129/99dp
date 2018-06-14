#!/bin/bash

DIR="$( cd "$( dirname "$0"  )" && pwd )"

rm -rf ${DIR}/dist

npm run build
mkdir -p ${DIR}/dist/static/static
mv ${DIR}/dist/static/*.woff ${DIR}/dist/static/static/.
mv ${DIR}/dist/static/*.ttf  ${DIR}/dist/static/static/.
mv ${DIR}/dist/static/*.eot  ${DIR}/dist/static/static/.

rm -rf ${DIR}/dist.tar.gz
tar zcf ${DIR}/dist.tar.gz ${DIR}/dist


