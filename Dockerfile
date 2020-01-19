FROM ubuntu-nginx-php

RUN apt-get update

RUN apt-get install -y git

RUN apt-get install -y ruby-full

RUN curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
RUN sudo apt-get install -y nodejs
RUN nodejs -v

COPY package.json package-lock.json ./
RUN cd /var/www
RUN mkdir html
RUN npm install
RUN npm install -g gulp-cli
RUN gem install jekyll
