# HudsonAlpha Tech Challenge: Blockchains

A proof of concept system for storing private medical documents or genome data, such that the documents are highly available, secure, and patients control who has access. This project was created during the [HudsonAlpha Tech Challenge](https://hudsonalpha.org//techchallenge/).

This project is based on the Ethereum blockchain. A contract deployed on the Ethereum blockchain stores available documents, each of which is a reference to an encrypted document in Ethereum Swarm. Documents are encrypted/decrypted within the browser.

The entire application can be hosted in a decentralized way, as static web files and encrypted documents are stored in Swarm, and state data is stored in the blockchain.

# Instructions

## Run Tests

```shell
truffle develop
truffle(develop)> test
```

## Deploy to a local environment

The following assume the Truffle test account is being used:
`candy maple cake sugar pudding cream honey rich smooth crumble sweet treat`

Import the test account into Metamask and geth:
```shell
echo c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3 > pk.txt
geth account import pk.txt
```

Launch Truffle's in-memory blockchain:
```shell
truffle develop
```

Deploy contracts to blockchain within the Truffle shell:
```shell
truffle(develop)> migrate
```

Launch local Swarm instance:
```shell
swarm --bzzaccount 627306090abaB3A6e1400e9345bC60c78a8BEf57 --ens-api http://localhost:9545
```

Upload static web files to Swarm:
```shell
./upload_static_files.sh
```

Point Metamask at your local blockchain `http://localhost:9545/`

The site can now be accessed in swarm. E.g.: `http://127.0.0.1:8500/bzz:/198cd7ed96bc0d5237922df783bfd2a033a1f0ee9ac7e6d48dff93564e71870b/index.html`

