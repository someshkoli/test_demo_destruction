ARG NODE_VERSION=12.18.3
FROM node:${NODE_VERSION}-alpine as os

ENV LOCATION="app/exams/java_exam"

# User account
RUN addgroup theia && \
    adduser -G theia -s /bin/sh -D theia;

# Common deps
RUN apk add --no-cache make gcc g++ pkgconfig python libx11-dev libxkbfile-dev


FROM os as theia
# See : https://github.com/theia-ide/theia-apps/issues/34

# Optionally build a striped Theia application with no map file or .ts sources.
# Makes image ~150MB smaller when enabled
ARG strip=true
ENV strip=$strip

# Theia application

WORKDIR /home/theia
ADD $LOCATION/package.json package.json

# NODE_OPTIONS="--max_old_space_size=4096" we can use this to limit it
RUN if [ "$strip" = "true" ]; then \
    yarn --pure-lockfile && \
    NODE_OPTIONS="--max_old_space_size=4096" yarn theia build && \
    yarn theia download:plugins && \
    yarn --production && \
    yarn autoclean --init && \
    echo *.ts >> .yarnclean && \
    echo *.ts.map >> .yarnclean && \
    echo *.spec.* >> .yarnclean && \
    yarn autoclean --force && \
    yarn cache clean \
    ;else \
    yarn --cache-folder ./ycache && rm -rf ./ycache && \
    yarn theia build && yarn theia download:plugins \
    ;fi

FROM os

COPY --from=theia /home/theia /home/theia
WORKDIR /home/theia

# C/C++ Developer tools

RUN chmod g+rw /home && \
    mkdir -p /home/exam && \
    chown -R theia:theia /home/theia && \
    chown -R theia:theia /home/exam;

# ADD $LOCATION/tasks /home/exam

# Install and configure nginx and other basic tools
RUN apk add --no-cache git openssh bash nginx openrc

ADD app/nginx.conf /etc/nginx/nginx.conf
# Add exam script
ADD app/start_exam.sh /etc/start_exam.sh
RUN mkdir -p /run/nginx

EXPOSE 3000
EXPOSE 4000
ENV SHELL=/bin/bash \
    THEIA_DEFAULT_PLUGINS=local-dir:/home/theia/plugins

CMD [ "/etc/start_exam.sh"]