FROM node:14-alpine

ENV LANG "C.UTF-8"

RUN \
  npm install -g npm

RUN \
  apk update && \
  apk upgrade

RUN \
  apk add --no-cache \
  zsh \
  tmux \
  sudo \
  git \
  openssh \
  neovim \
  direnv \
  binutils \
  coreutils \
  findutils \
  diffutils \
  moreutils \
  tar \
  grep \
  sed \
  libxml2-dev \
  postgresql-dev \
  make \
  gcc \
  libc-dev \
  tzdata \
  build-base \
  curl \
  curl-dev

ARG UID
ARG GID

RUN \
  apk add --no-cache shadow && \
  groupmod -g ${GID:-1000} node && \
  usermod -u ${UID:-1000} node && \
  touch /home/node/.zshrc && \
  echo "node ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/node && \
  apk del shadow

WORKDIR /workspace

EXPOSE 8000

CMD ["/usr/bin/tail", "-f", "/dev/null"]
