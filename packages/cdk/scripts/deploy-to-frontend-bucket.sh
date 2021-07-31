#!/bin/bash

deploy-to-bucket() {
  BUCKET=$1
  if [[ ! -n "${BUCKET}" ]]
  then
    echo "error, deploy-to-bucket: bad bucket name ${BUCKET}"
    exit 1
  fi
  if ! aws s3 ls "s3://${BUCKET}" &> /dev/null
  then
    echo "error, deploy-to-bucket: unable to ls on s3://${BUCKET}"
    exit 1
  fi
  cd frontend
  aws s3 sync --content-type "text/html" --exclude "*" --include "*.html" --delete build/ s3://${BUCKET}/
  aws s3 sync --content-type "text/css" --exclude "*" --include "*.css" --include "*.css.map" --delete build/ s3://${BUCKET}/
  aws s3 sync --content-type "text/javascript" --exclude "*" --include "*.js" --include "*.js.map" --delete build/ s3://${BUCKET}/
  aws s3 sync --content-type "application/json" --exclude "*" --include "*.json" --delete build/ s3://${BUCKET}/
  aws s3 sync --content-type "image/x-icon" --exclude "*" --include "*.ico" --delete build/ s3://${BUCKET}/
  aws s3 sync --content-type "image/svg+xml" --exclude "*" --include "*.svg" --delete build/ s3://${BUCKET}/
  aws s3 sync --content-type "image/png" --exclude "*" --include "*.png" --delete build/ s3://${BUCKET}/
  aws s3 sync --content-type "image/jpeg" --exclude "*" --include "*.jpg" --delete build/ s3://${BUCKET}/
}
  