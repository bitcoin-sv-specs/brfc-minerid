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
        "blockSize": number
    }
  }
}
```

|     field     	|  function  	|
|------------	|-------	|
| `txCount` 	| number of transactions in current block 	|
| `blockSize` 	| size of current block (in `bytes`) 	|


## Example 

```json
{
  // basic MinerId fields

  "extensions": {
    "blockInfo": {
        "txCount": 1000,
        "blockSize": 1000000
    }
  }
}
```