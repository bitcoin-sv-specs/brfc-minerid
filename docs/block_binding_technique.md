# Block binding security hardening feature

Blockbind technique describes a robust way of making the MinerId specific to the block it's in by adding block specific data into the final MinerInfo coinbase output. However, doing this creates a causality dilemma _(chicken/egg scenario)_ since the header cannot be finalised and signed by the MinerId key without the hash of the coinbase transaction which, in turn, cannot be created until the MinerId key is finalised. The solution to that is detailed below:

To get around the chicken/egg scenario described above we recalculate the Merkle tree but replace the coinbase transaction with a modified coinbase transaction _(shown below)_ which ensures that _blockBind_ signature can only be valid if contained within the block that the miner intended.

## 1. Modified MinerInfo coinbase transaction

Steps to create the modified miner-info coinbase transaction:

1.  Begin with a copy of the original coinbase transaction _(with coinbase1, extranonce1, extranonce2 and coinbase2 parts - see [Mining Protocol v1](https://braiins.com/stratum-v1/docs) definition)_
2.  Replace the coinbase input _scriptSig_ with an 8 byte array of zeros and ensuring that the length field proceeding the _scriptSig_ is also set to 8. This zeros _extranonce1_ and _extranonce2_ fields.
    1.  scriptlen: `0x08`
    2.  scriptSig: `0x0000000000000000`
3.  Set the remaining fields of _coinbase1_ to the following values:
    1.  version:  `0x01000000`
    2.  input count: `0x01`
    3.  previous hash: `0x0000000000000000000000000000000000000000000000000000000000000000`
    4.  index: `0xffffffff`
4.  Add a miner-info output script with a _minerInfoTxId_ data field: `OP_0 OP_RETURN 0x601dface 0x00 minerInfoTxId`.

> Note: The choice to use an 8 byte array of zeroes is simply for compatibility with existing bitcoin libraries. Many libraries will check to ensure the coinbase input is valid and one of those rules requires the coinbase to be at least 4 bytes.

## 2. Modified merkle root

Double hash the modified MinerInfo coinbase transaction to get a new transaction ID and modify the Merkle proof by replacing the original coinbase transaction ID with the ID generated. After that calculate `modifiedMerkleRoot` from Merkle branch.

## 3. blockBind

It's a hash over the modified Merkle root and previous block hash concatenated field:

`Hash256(concat(modifiedMerkleRoot, prevhash))`

> Note: The concatenation is done on the hex encoded bytes.

## 4. blockBindSig

It's a signature over the _blockBind_ field using the private key associated with the _minerId_ public key.

## 5. Location

The _blockBind_ and _blockBindSig_ fields are added to the final MinerInfo coinbase output which is defined as below:

`OP_0 OP_RETURN 0x601dface 0x00 minerInfoTxId blockBind blockBindSig`

# Summary

Thanks to this technique, the worst an attacker can do is to mine exactly the same block paying to the same _(authentic miner)_ outputs. They can modify the coinbase text but nothing else without invalidating the _blockBind_ and _blockBindSig_ fields, further disincentivising an attack as the block reward is added to the cost of the attack.
