// Distributed under the Open BSV software license, see the accompanying file LICENSE.

// The main function which does create a mining candidate job - with or without miner ID.

// This sample implementation aims to show how to integrate the Miner ID support into mining scripts.

// Note:
// This function handles two miningCandidate.heigh conditions:
// (a) this.currentJob.height === miningCandidate.height, and
// (b) this.currentJob.height < miningCandidate.height
// A situation where this.currentJob.height > miningCandidate.height is supported by the caller.

// Data types defined externally and used by this function:
//
// export interface GetOPReturnDto {
//   blockHeight: string
//   alias: string
// }
// export interface PostCoinbase2Dto {
//  prevhash: string
//  merkleProof: string[]
//  alias: string
//  coinbase2: string
//  minerInfoTxId: string
// }
// class MiningCandidateJob {
//  private readonly coinbase: Coinbase
//  private readonly candidateId: string
//  private readonly submits: string[] = []
//  private _jobId: string
//  private _coinbaseParts!: Buffer[]
//  private readonly _daemonId: string
//  private readonly _height!: number
//  private readonly _prevHash!: string
//  private readonly _merkleBranch!: string[]
//  private readonly _version!: number
//  private readonly _time!: number
//  private readonly _bits!: string
//  private readonly _merkleTree!: MerkleTree
//  private readonly _difficulty!: number
//  private readonly _target!: BigNum
//  private readonly _coinbaseValue!: number
//  private readonly _numOfTx: number
//  ...
//}

private async createNewJobAsync(template: MiningTemplate): Promise<MiningCandidateJob> {
  const jobId = this.getNewJobId()
 
  if (this.poolConfig.coinbase.minerId.enabled && this.providerConfig.minerIdConfig !== undefined) {

    const miningCandidate = template.result
    // Request the Node to return its in-mempool miner-info transaction id
    // (the getminerinfotxid RPC interface is called).
    const getMinerInfoTxId = async (): Promise<string> => {
       const minerInfoTxId = await this.nodeService.getMinerInfoTxId({ daemonId: template.instance.id })).firstOrDefault()?.result
       if (minerInfoTxId.length < 1) {
           throw new Error("getminerinfotxid rpc result, returned by the Node, is empty!")
       }
       return minerInfoTxId
    }
    // Get a miner-info op_return script from the MID Generator
    // (the 'GET /opreturn/:alias/:blockHeight([0-9]+)' method is called).
    const getMinerInfoOpReturnScript = async (height): Promise<string> => {
       const opReturn: GetOPReturnDto = {
           blockHeight: height,
           alias: this.providerConfig.minerIdConfig.alias
       }
       const minerInfoOpReturnScript = await this.minerId.getOpReturnAsync(opReturn)
       if (minerInfoOpReturnScript.length < 1) {
           throw new Error("minerInfoOpReturnScript result, returned by the Generator, is empty!")
       }
       return minerInfoOpReturnScript
    }
    // Request the Node to create a miner-info transaction containing the specified miner-info script
    // (the createminerinfotx RPC interface is called).
    const createMinerInfoTx = async (minerInfoOpReturnScript) : Promise<string> => {
       const minerInfoTxId = (await this.daemonManager.createMinerInfoTx({ hexdata: minerInfoOpReturnScript }, {})).first().result
       if (minerInfoTxId.length < 1) {
           throw new Error("createminerinfotx rpc result, returned by the Node, is empty!")
       }
       return minerInfoTxId
    }
    // Request the Node to replace its miner-info transaction by a new one containing the specified miner-info script
    // (the replaceminerinfotx RPC interface is called).
    const replaceMinerInfoTx = async (minerInfoOpReturnScript) : Promise<string> => {
       minerInfoTxId = (await this.daemonManager.replaceMinerInfoTx({ hexdata: minerInfoOpReturnScript }, {})).first().result
       if (minerInfoTxId.length < 1) {
           throw new Error("recreateminerinfotx rpc result, returned by the Node, is empty!")
       }
    }
 
    let minerInfoTxId = {}

    // If the height hasn't been changed, then the correct miner-info tx should be included in the miningCandidate.
    if (this.currentJob.height === miningCandidate.height) {
       // Check if the last miner-info opreturn script has not been invalidated
       // (the 'GET /opreturn/:alias/isvalid' method is called).
       if (!(await this.minerId.getIsOpReturnValidAsync(this.providerConfig.minerIdConfig.alias))) {
          // Get a miner-info op_return script from the MID Generator.
          const minerInfoOpReturnScript = await getMinerInfoOpReturnScript(miningCandidate.height)
          // Request the Node to replace its miner-info transaction by a new one containing the specified miner-info script.
          minerInfoTxId = await replaceMinerInfoTx(minerInfoOpReturnScript)
          // Request the Node to return a new mining candidate with the miner-info transaction included.
          template = (await this.getMiningTemplate(this.jobManager.currentJob.daemonId)).first()
       }
       else {
          // Request the Node to return its in-mempool miner-info transaction id.
          minerInfoTxId = await getMinerInfoTxId()
       }
    }
    // The node's activeChainTip has been extended, and thus create a new miner-info tx.
    else
    {
       // Get a miner-info op_return script from the MID Generator.
       const minerInfoOpReturnScript = await getMinerInfoOpReturnScript(miningCandidate.height)
       // Request the Node to create a miner-info transaction containing the specified miner-info script.
       minerInfoTxId = await createMinerInfoTx(minerInfoOpReturnScript)
       // Request the Node to return a new mining candidate with the miner-info transaction included.
       template = (await this.getMiningTemplate(this.jobManager.currentJob.daemonId)).first()
    }

    const miningCandidateJob = new MiningCandidateJob(
      jobId,
      template.instance.id,
      template.result,
      this.minerId,
      this.merchantApi,
      this.poolAddressScript,
      this.poolConfig.coinbase,
      this.recipientManager.getRecipients(),
      this.extraNonce.extraNoncePlaceholder,
      this.diff1
    )
 
    const [coinbase1, coinbase2] = miningCandidateJob.coinbaseParts
 
    // Request the Generator to update the coinbase2 part
    // (to add the miner ID coinbase op_return script using the 'POST /coinbase2' method).
    const args1: PostCoinbase2Dto = {
      alias: this.providerConfig.minerIdConfig.alias,
      minerInfoTxId: minerInfoTxId,
      prevhash: template.prevhash,
      merkleProof: template.merkleProof,
      coinbase2: coinbase2.toString("hex")
    }
    const res1 = await this.minerId.postCoinbase2Async(args1)
    if (res1.length < 1) {
      throw new Error("Coinbase2 result, returned by the Generator, is empty!")
    }
    const modifiedCoinbase2 = Buffer.from(res1, "hex")
    miningCandidateJob.coinbaseParts = [coinbase1, modifiedCoinbase2]

    // Return a mining candidate job with miner ID.
    return miningCandidateJob
  }
  // Return a mining candidate job without miner ID.
  return new MiningCandidateJob (
    jobId,
    template.instance.id,
    template.result,
    this.minerId,
    this.merchantApi,
    this.poolAddressScript,
    this.poolConfig.coinbase,
    this.recipientManager.getRecipients(),
    this.extraNonce.extraNoncePlaceholder,
    this.diff1
  )
}
