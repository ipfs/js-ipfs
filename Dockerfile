FROM node:9.5.0

WORKDIR /usr/src/app
COPY . /usr/src/app

ENV IPFS_WRTC_LINUX_WINDOWS=1
ENV IPFS_BOOTSTRAP=1
ENV IPFS_MONITORING=1
ENV IPFS_PATH=/root/.jsipfs
ENV IPFS_API_HOST=0.0.0.0

ENV BUILD_DEPS='libnspr4 libnspr4-dev libnss3'

EXPOSE 4002
EXPOSE 4003
EXPOSE 5002
EXPOSE 9090

RUN apt-get update \
  && apt-get install --yes $BUILD_DEPS \
  && rm -rf /var/lib/apt/lists/* \
  && npm install --production \
  && npm install wrtc@0.0.67 --production \
  && npm cache clear --force \
  && apt-get purge --yes $BUILD_DEPS \
  && rm -rf /usr/share/doc /usr/share/locale \
  && rm -rf /usr/local/share/.cache \
  && rm -rf node_modules/go-ipfs-dep/go-ipfs/ipfs \
  && ln -s $(pwd)/src/cli/bin.js /usr/local/bin/jsipfs

CMD ./init-and-daemon.sh
