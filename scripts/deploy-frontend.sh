#!/bin/bash
set -e

STACKNAME=$(npx @cdk-turnkey/stackname --suffix webapp)
BUCKET=$(aws cloudformation describe-stacks \
  --stack-name ${STACKNAME} | \
  jq '.Stacks | map(select(.StackName == "'${STACKNAME}'"))[0].Outputs | map(select(.OutputKey == "FrontendBucketName"))[0].OutputValue' | \
  tr -d '"')

echo "BUCKET:"
echo "${BUCKET}"

source scripts/deploy-to-frontend-bucket.sh
deploy-to-bucket ${BUCKET}
