# MinerId extension fields

|     BRFC     	|  title  	|  authors 	| version 	|
|:------------:	|:-------:	|:--------:	|:-------:	|
| b8930c2bbf5d 	| minerIdExt-blockBind 	| nchain 	|   0.1   	|

## Block binding security extension

This extension technique describes a more robust way of making the MinerId specific to the to block it's in by adding block specific data into the MinerId document. However, doing this creates a causality dilemma (chicken/egg scenario) since the header cannot be finalised and signed by the MinerId key without the hash of the coinbase transaction which, in turn, cannot be created until the MinerId key is finalised. The solution to that is detailed below:

To get around the chicken/egg scenario described above we recalculate the Merkle tree but replace the coinbase transaction with a modified coinbase transaction (shown below) which ensures that dynamic MinerId signature can only be valid if contained within the block that the miner intended.

### Modified coinbase transaction

In order the create the modified coinbase transaction:
1. Begin with a copy of the original coinbase transaction
2. Replace the coinbase input scriptSig with an 8 byte array of zeros `0x0000000000000000` ensuring that the length field preceeding the scriptSig is also set to 8.
3. Replace the scriptPubKey of the output containing the coinbase document with `OP_FALSE OP_RETURN`

Note: the choice to use an 8 byte array of zeroes is simply for compatibility with existing bitcoin libraries. Many libraries will check to ensure the coinbase input is valid and one of those rules requires the coinbase to be at least 4 bytes.

### Modifed merkle root

Double hash the modified coinbase transaction to get a new transaction ID and modify the merkle root by replacing the original coinbase transaction ID with the ID generated.

## Location

The blockBind object should be located under the `extensions` field of the `dynamic-CD`

```json
{
  // basic MinerId fields

  "extensions": {
    "blockBind": {
        "prevBlockHash": string,
        "modifiedMerkleRoot": string,
    }
  }
}
```

|     field     	|  function  	|
|------------	|-------	|
| `prevBlockHash` 	| hash of the previous block, should match the same field in the block header 	|
| `modifiedMerkleRoot` 	| size of current block (in `bytes`) 	|


## Example 

```json
{
  // basic MinerId fields

  "extensions": {
    "blockBind": {
        "prevBlockHash": "0000000000000000009ead1c001bc95c8afec4b4aa308952bd9ba1889ea8f134",
        "modifiedMerkleRoot": "b98eafaaad2bd3a3becc986ac81af4dc83886972df967628cc1035ede9e50300"
    }
  }
}
```

 If MinerId is implemented with security hardening the worst an attacker can do is mine exactly the same block paying to the same (authentic miner) outputs. They can modify the coinbase text but nothing else without invalidating the dynamic coinbase signature, further disincentivising an attack as the block reward is added to the cost of the attack.