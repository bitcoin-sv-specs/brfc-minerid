# MinerId extension fields

|     BRFC     	|  title  	|  authors 	| version 	|
|:------------:	|:-------:	|:--------:	|:-------:	|
| 1b1d980b5b72 	| minerIdExt-minerParams 	| nChain 	|   0.1   	|

## Miner policy and consensus configuration

This extension enables the miner to broadcast their current miner policy and consensus parameters. All fields are optional and any commonly known configuration paramter can be included. By convention the name of the parameter used in the Bitcoin SV reference implementation of bitcoind is used.

## Location

The minerParams object should be located under the `extensions` field of the `static-CD`


```json
{
  // basic MinerId fields

  "extensions": {
    "minerParams": {
			"policy": {
				"blockmaxsize": number,
				"maxstackmemoryusagepolicy": number,
			},
			"consensus": {
				"excessiveblocksize": number,
				"maxstackmemoryusageconsensus": number
			}
    }
  }
}
```

|     field     	|  function  	|
|------------	|-------	|
| `blockmaxsize` 	| current miner soft cap (in `bytes`)	|
| `excessiveblocksize` 	| current miner hard cap (in `bytes`)	|
| `maxstackmemoryusagepolicy` 	| current miner policy max_stack_memory usage (in `bytes`)	|
| `maxstackmemoryusageconsensus` 	| current miner consensus max_stack_memory usage (in `bytes`)	|  


## Example 

```json
{
  // basic MinerId fields

  "extensions": {
    "minerParams": {
			"policy": {
				"blockmaxsize": 512000000,
				"maxstackmemoryusagepolicy": 10000000,
			},
			"consensus": {
				"excessiveblocksize": 1000000000,
				"maxstackmemoryusageconsensus": 100000000
			}
    }
  }
}
```