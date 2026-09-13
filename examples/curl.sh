#!/usr/bin/env sh
set -eu
: "${RAPIDAPI_BASE_URL:?Set marketplace HTTPS base URL}"
: "${RAPIDAPI_KEY:?Set your consumer subscription key}"
: "${RAPIDAPI_HOST:?Set the marketplace host}"
curl --fail-with-body --max-time 15 \
  --request POST "$RAPIDAPI_BASE_URL/v1/validate" \
  --header "Content-Type: application/json" \
  --header "X-RapidAPI-Key: $RAPIDAPI_KEY" \
  --header "X-RapidAPI-Host: $RAPIDAPI_HOST" \
  --data-binary @examples/request.json
