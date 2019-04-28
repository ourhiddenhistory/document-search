#!/bin/bash

GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
DOMAIN="ourhiddenhistory.org"
CONFIG_FILE="_config.yml"

if [ "${GIT_BRANCH}" == "master" ]
then
  DOMAIN="ourhiddenhistory.org"
  CONFIG_FILE="_config.yml"
fi

gulp build

bundle exec jekyll build --config ${CONFIG_FILE}

ssh useful@50.87.146.99 -p 2222 -o StrictHostKeyChecking=no "mkdir -p /home2/useful/${DOMAIN}/html/doc-search"

rsync -acr --stats -e "ssh -p 2222 -o StrictHostKeyChecking=no" \
   ./_site/ useful@50.87.146.99:/home2/useful/${DOMAIN}/html/doc-search
