const bsv = require('bsv')

const protocolName = 'ac1eed88'
const cbdVersion = '0.1'

function createCoinbaseDocument(height, minerId, prevMinerIdPrivKey, vcTx, optionalData) {
    prevMinerId = prevMinerIdPrivKey.toPublicKey().toString()

    prevMinerId = prevMinerId || minerId

    const minerIdSigPayload = Buffer.concat([
        Buffer.from(prevMinerId),
        Buffer.from(minerId),
        Buffer.from(vcTx)
    ])

    const hash = bsv.crypto.Hash.sha256(minerIdSigPayload)
    const prevMinerIdSig = bsv.crypto.ECDSA.sign(hash, prevMinerIdPrivKey).toString()

    const doc = {
        version: cbdVersion,
        height: height,

        prevMinerId: prevMinerId,
        prevMinerIdSig: prevMinerIdSig,

        minerId: minerId,

        vctx: {
            txId: vcTx,
            vout: 0
        }
    }
    if (optionalData) {
        doc.minerContact = optionalData
    }
    return doc
}

function createMinerIdOpReturn(height, minerIdPrivKey, prevMinerIdPrivKey, vcTx, mc) {
    minerId = minerIdPrivKey.toPublicKey().toString()
    const doc = createCoinbaseDocument(height, minerId, prevMinerIdPrivKey, vcTx, mc)

    const payload = JSON.stringify(doc)

    const hash = bsv.crypto.Hash.sha256(Buffer.from(payload))
    const signature = bsv.crypto.ECDSA.sign(hash, minerIdPrivKey).toString()

    const opReturnScript = bsv.Script.buildSafeDataOut([protocolName, payload, signature]) //.toHex()
    return opReturnScript
}




let h = 123
let v = "11c9f0be55da88192f1b6538468975bcfc1635c48f1ce9eeae12cdaefc5a4c99"
let mc = {
    name: "demo",
    email: "demo@demo.com",
    merchantAPIEndPoint: "api.demo.com"
}
let prevMinerIdPrivKey = new bsv.PrivateKey()
let minerIdPrivKey = new bsv.PrivateKey()


let payload = createMinerIdOpReturn(h, minerIdPrivKey, prevMinerIdPrivKey, v, mc)
console.log(payload);