#!/bin/bash

GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
DOMAIN="b.ourhiddenhistory.org"
CONFIG_FILE="_config.stg.yml"

if [ "${GIT_BRANCH}" == "master" ]
then
  DOMAIN="ourhiddenhistory.org"
  CONFIG_FILE="_config.yml"
fi

gulp build

ls ./_posts/

bundle exec jekyll build --config ${CONFIG_FILE}

gulp copySiteToWebroot

ssh useful@50.87.146.99 -p 2222 -o StrictHostKeyChecking=no "mkdir -p /home2/useful/${DOMAIN}/html/doc-search"

rsync -acrv --stats -e "ssh -p 2222 -o StrictHostKeyChecking=no" \
   ./html/doc-search/ useful@50.87.146.99:/home2/useful/${DOMAIN}/html/doc-search
