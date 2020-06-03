# MinerId extension fields

|     BRFC     	|  title  	|  authors 	| version 	|
|:------------:	|:-------:	|:--------:	|:-------:	|
| 62b21572ca46	| minerIdExt-feeSpec 	| nchain 	|   0.1   	|

## Block info

This extension enables the miner to publish default fee rates.  This is informational only as the Merchant API is the mechanism for real-time querying of miners for current fee rates.

>**Note**: this fee refers to the miner's default, publicly available fee rates (i.e. calling [MAPI](https://github.com/bitcoin-sv-specs/brfc-merchantapi) *without* a token or user authentication).

## Location

The blockInfo object should be located under the `extensions` field of the `dynamic-CD`


```json
{
  // basic MinerId fields

  "extensions": {
    "feeSpec": {
        "defaultFee": array
    }
  }
}
```

|     field     	|  function  	|
|------------	|-------	|
| `defaultFee` 	| default fee rate as specified in [brfc-misc/feespec](../../../brfc-misc/feespec/README.md) 	|


## Example 

```json
{
  // basic MinerId fields

  "extensions": {
    "feeSpec": {
        "fees": [
            {
                "feeType": "standard",
                    "miningFee": {
                        "satoshis": 1,
                        "bytes": 1
                    },
                    "relayFee": {
                        "satoshis": 1,
                        "bytes": 10
                    }
            },
            {
                "feeType": "data",
                "miningFee": {
                    "satoshis": 2,
                    "bytes": 1000
                },
                "relayFee": {
                    "satoshis": 1,
                    "bytes": 10000
                }
            }
        ]
        }
    }
  }
}
```