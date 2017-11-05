#!/bin/bash
npm run build
find build_webpack -name "*.map" -exec rm {} \;
swarm --bzzaccount 627306090abaB3A6e1400e9345bC60c78a8BEf57 --ens-api http://localhost:9545 --recursive up build_webpack
