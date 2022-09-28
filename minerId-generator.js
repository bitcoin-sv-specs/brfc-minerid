// Distributed under the Open BSV software license, see the accompanying file LICENSE.

const bsv = require('bsv')

const protocolName = '601dface'
const cbdVersion = '0.3'
const protocolIdVersion = '00'

function createMinerInfoDocument (height, minerIdPublicKey, prevMinerIdPrivKey, revocationKeyPublicKey, prevRevocationKeyPrivKey, optionalData) {
  let prevMinerIdPublicKey = prevMinerIdPrivKey.toPublicKey().toString()

  prevMinerIdPublicKey = prevMinerIdPublicKey || minerIdPublicKey
  const minerIdSigPayload = Buffer.concat([
    Buffer.from(prevMinerIdPublicKey, 'hex'),
    Buffer.from(minerIdPublicKey, 'hex')
  ])
  const hash = bsv.crypto.Hash.sha256(minerIdSigPayload)
  const prevMinerIdSig = bsv.crypto.ECDSA.sign(hash, prevMinerIdPrivKey).toString()

  let prevRevocationKeyPublicKey = prevRevocationKeyPrivKey.toPublicKey().toString()
  prevRevocationKeyPublicKey = prevRevocationKeyPublicKey || revocationKeyPublicKey
  const prevRevocationKeySigPayload = Buffer.concat([
    Buffer.from(prevRevocationKeyPublicKey, 'hex'),
    Buffer.from(revocationKeyPublicKey, 'hex')
  ])
  const hash2 = bsv.crypto.Hash.sha256(prevRevocationKeySigPayload)
  const prevRevocationKeySig = bsv.crypto.ECDSA.sign(hash2, prevRevocationKeyPrivKey).toString()

  const doc = {
    version: cbdVersion,
    height: height,

    prevMinerId: prevMinerIdPublicKey,
    prevMinerIdSig: prevMinerIdSig,

    minerId: minerIdPublicKey,

    prevRevocationKey: prevRevocationKeyPublicKey,
    prevRevocationKeySig: prevRevocationKeySig,

    revocationKey: revocationKeyPublicKey,
  }
  if (optionalData) {
    doc.minerContact = optionalData
  }
  return doc
}

function createMinerInfoOpReturn (height, minerIdPrivKey, prevMinerIdPrivKey, revocationKeyPrivKey, prevRevocationKeyPrivKey, mc) {
  const minerIdPublicKey = minerIdPrivKey.toPublicKey().toString()
  const revocationKeyPublicKey = revocationKeyPrivKey.toPublicKey().toString()
  const doc = createMinerInfoDocument(height, minerIdPublicKey, prevMinerIdPrivKey, revocationKeyPublicKey, prevRevocationKeyPrivKey, mc)

  const payload = JSON.stringify(doc)

  const hash = bsv.crypto.Hash.sha256(Buffer.from(payload))
  const signature = bsv.crypto.ECDSA.sign(hash, minerIdPrivKey).toString()

  const opReturnScript = bsv.Script.buildSafeDataOut([protocolName, protocolIdVersion, payload, signature]).toHex()
  return opReturnScript
}

function createMinerInfoCoinbaseTxOpReturn (minerInfoTxId, blockBind, blockBindSig) {
  const minerInfoTxIdInLittleEndianRep = Buffer.from(minerInfoTxId, 'hex').reverse() // swap endianness before adding into the script
  return bsv.Script.buildSafeDataOut([protocolName, protocolIdVersion, minerInfoTxIdInLittleEndianRep, blockBind, blockBindSig]).toHex()
}

const height = 123
const mc = {
  name: 'demo',
  email: 'demo@demo.com',
  merchantAPIEndPoint: 'api.demo.com'
}
const prevMinerIdPrivKey = new bsv.PrivateKey()
const minerIdPrivKey = new bsv.PrivateKey()

const prevRevocationKeyPrivKey = new bsv.PrivateKey()
const revocationKeyPrivKey = new bsv.PrivateKey()

const minerInfoOpReturn = createMinerInfoOpReturn(height, minerIdPrivKey, prevMinerIdPrivKey, revocationKeyPrivKey, prevRevocationKeyPrivKey, mc)
console.log(`Miner-info op_return Output Script: ${minerInfoOpReturn}`)

const minerInfoTxId = "f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16"
const blockBind = "0028944a3a436201521bafa5cf82f873c04d212d62d5811324a1fd14095a6ea2"
const blockBindSig = "304402206ea641c5a1568d06572629ab46deef74b351d65e5d3112c9c24cecd896a1108c0220337ba129162c26e6aa996d1f88164566c03ee395d75a63033cb421fc432f1e7a"
const midCoinbaseOpReturn = createMinerInfoCoinbaseTxOpReturn(minerInfoTxId, blockBind, blockBindSig)
console.log(`Miner ID Coinbase Tx op_return Output Script: ${midCoinbaseOpReturn}`)
