# MinerId extension fields

|     BRFC     	|  title  	|  authors 	| version 	|
|:------------:	|:-------:	|:--------:	|:-------:	|
| a224052ad433 	| minerIdExt-blockInfo 	| nchain 	|   0.1   	|

## Block info

This extension enables the miner to give further information about the block not contained in the block header.

## Location

The blockInfo object should be located under the `extensions` field of the `dynamic-CD`


```json
{
  // basic MinerId fields

  "extensions": {
    "blockInfo": {
      "txCount": number,
      "sizeWithoutCoinbase": number
    }
  }
}
```

|     field     	|  function  	|
|------------	|-------	|
| `txCount` 	| number of transactions in current block 	|
| `sizeWithoutCoinbase` 	| size of current block excluding the coinbase transaction (in `bytes`) 	|

>**Note**: Since the data in this extension will go into the coinbase document before being signed, it is impossible to definitively know what the total size of the block will be (since Bitcoin/DER signatures are not fixed length and vary between 71 and 73 bytes). For this reason, the `sizeWithoutCoinbase` is provided instead of the full block size. Also anyone who has access to this data will already likely have access to the coinbase tx and thus can add its length to the sizeWithoutCoinbase to calculate the exact block size (as shown below).
```
blockSize = size(coinbase_tx) + sizeWithoutCoinbase
```

## Example 

```json
{
  // basic MinerId fields

  "extensions": {
    "blockInfo": {
      "txCount": 1517,
      "sizeWithoutCoinbase": 1008368
    }
  }
}
```