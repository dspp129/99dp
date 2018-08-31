#!/bin/bash

DIR="$( cd "$( dirname "$0"  )" && pwd )"

rm -rf ${DIR}/dist

npm run build

rm -rf ${DIR}/dist.tar.gz
tar zcf ${DIR}/dist.tar.gz ${DIR}/dist


