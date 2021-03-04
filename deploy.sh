#!/bin/bash

GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
DOMAIN="b.ourhiddenhistory.org"
CONFIG_FILE="_config.stg.yml"

if [ "${GIT_BRANCH}" == "main" ]
then
  DOMAIN="ourhiddenhistory.com"
  CONFIG_FILE="_config.yml"
fi

echo "Deploying..."
echo "    Branch: ${GIT_BRANCH}"
echo "    To domain: ${DOMAIN}"
echo "    Using config: ${CONFIG_FILE}"

echo "PRE-BUILD"
rm -rf ./html
mkdir html
ls -lA index.html _data

echo "RUNNING gulp build..."
gulp build

echo "RUNNING bundle exec jekyll build --config ${CONFIG_FILE}..."
bundle exec jekyll build --config ${CONFIG_FILE}

echo "RUNNING gulp copySiteToWebRoot..."
gulp copySiteToWebRoot

echo "POST-BUILD"
ls -lA index.html _data

echo "RSYNCING TO ${DOMAIN}"
ssh useful@50.87.146.99 -p 2222 -o StrictHostKeyChecking=no \
   "mkdir -p /home2/useful/${DOMAIN}/html/doc-search"

rsync -acrv --stats --delete-after -e "ssh -p 2222 -o StrictHostKeyChecking=no" \
   ./html/doc-search/ useful@50.87.146.99:/home2/useful/${DOMAIN}/public/doc-search
