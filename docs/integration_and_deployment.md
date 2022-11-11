Integration and Deployment
==========================

To enable the Miner ID 1.0 Protocol support it is required to integrate the Miner ID Generator and Node Software with the Mining Pool Software _(e.g., S-NOMP Software)_.

## 1. Components

### 1.1 Miner ID Generator (a.k.a MID Generator)

The Generator's Web API integration with S-NOMP requires to adopt the following compulsory methods:

*   `GET /opreturn/:alias/:blockHeight([0-9]+)`
*   `GET /opreturn/:alias/isvalid`
*   `POST /coinbase2`

#### 1.1.1 DataRefs

DataRefs support is an optional miner ID feature which additionally requires to integrate:

*   `GET /datarefs/:alias/opreturns`
*   `GET /opreturn/:alias/:blockHeight([0-9]+)/:dataRefsTxId`

### 1.2 Node

The Node exposes compulsory RPC methods to be used by S-NOMP:

*   `createminerinfotx`
*   `replaceminerinfotx`
*   `getminerinfotxid`

#### 1.2.1 DataRefs

To support this optional feature the Node exposes the below RPC methods to be used by S-NOMP:

*   `createdatareftx`
*   `getdatareftxid`

### 1.3 S-NOMP

stn-open-miner: An example how to update the main method which directly uses the interface to configure the mining candidate job.

*   [open-miner-sample-integration](open-miner-sample-integration.js)
*   [open-miner-sample-integration-with-datarefs-support](open-miner-sample-integration-with-datarefs-support.js)

## 2. Deployment

### 2.1 Miner ID Generator

Use the Generator's docker image from the Docker Hub repository or install the Generator's server from a source code _(see References point 1.b)_.

### 2.2 Node

Compile and build binaries from the source code or use an official build.

## 3. Configuration

### 3.1 Miner ID Generator

Create a new Miner ID reputation chain from scratch or upgrade an existing one using CLI commands _(see References point 1.a)_.

### 3.2 Node Software

To allow the node to sign a miner info transaction an operator must perform an initial configuration.

1.  Create a BIP-32 signing key to sign a miner info tx.
    1. `bitcoin-cli makeminerinfotxsigningkey`
        
2.  Get the miner info funding address.
    1. `bitcoin-cli getminerinfotxfundingaddress`
        
3.  Send some minimal BSV amount to the miner info funding address, e.g., using:
    1. `bitcoin-cli sendtoaddress "address" "amount"`

> Note: 1 Satoshi is enough because miner-info and datarefs transactions pay no fee.
        
4.  Configure the node to use the miner info funding outpoint.
    1. `bitcoin-cli setminerinfotxfundingoutpoint "txid" "n"`

> Note: The correct value for the `"n"` parameter can be checked by executing the `bitcoin-cli getrawtransaction "txid"` command and then decoding the returned raw transaction using the `decoderawtransaction` RPC command - to see at which index the funding output is defined.

In result, the node creates and configures _.minerinfotxsigningkey.dat_ and _minerinfotxfunding.dat_ files available under `~/.bitcoin/network_name/miner_id/Funding/` directory.

Make an independent funding configuration, on each of the mining nodes, to allow the mining pool to work on the same Miner ID reputation chain.

## 4. References

1. Miner ID Generator
    1. [spec](mid_generator/minerid-generator.md)
    2. [source code](https://github.com/bitcoin-sv/minerid-reference)
2. Miner ID 1.0 Protocol
    1. [spec](../README.md)
