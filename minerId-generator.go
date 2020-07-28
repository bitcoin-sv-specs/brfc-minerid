package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"

	"github.com/bitcoinsv/bsvd/bsvec"
	"github.com/libsv/libsv/transaction/output"
)

const protocolName = "ac1eed88"
const cbdVersion = "0.1"

type coinbaseDoc struct {
	Version        string       `json:"version"`
	Height         uint64       `json:"height"`
	PrevMinerID    string       `json:"prevMinerId"`
	PrevMinerIDSig string       `json:"prevMinerIdSig"`
	MinerID        string       `json:"minerId"`
	Vctx           vctx         `json:"vctx"`
	MinerContact   minerContact `json:"minerContact"`
}

type vctx struct {
	TxID string `json:"txId"`
	Vout uint64 `json:"vout"`
}

type minerContact struct {
	Name                string `json:"name"`
	Email               string `json:"email"`
	MerchantAPIEndPoint string `json:"merchantAPIEndPoint"`
}

func createCoinbaseDocument(height uint64, minerID string, prevMinerIDPrivKey *bsvec.PrivateKey, vcTx string, mc minerContact) (coinbaseDoc, error) {
	prevMinerID := prevMinerIDPrivKey.PubKey().SerializeCompressed()

	p1 := prevMinerID
	p2, _ := hex.DecodeString(minerID)
	p3, _ := hex.DecodeString(vcTx)

	payload := []byte{}
	payload = append(payload, p1...)
	payload = append(payload, p2...)
	payload = append(payload, p3...)

	hash := sha256.Sum256(payload)

	prevMinerIDSig, err := prevMinerIDPrivKey.Sign(hash[:])
	if err != nil {
		fmt.Println(err)
		return coinbaseDoc{}, err
	}

	v := vctx{
		TxID: vcTx,
		Vout: 0,
	}

	doc := coinbaseDoc{
		Version: cbdVersion,
		Height:  height,

		PrevMinerID:    hex.EncodeToString(prevMinerID),
		PrevMinerIDSig: hex.EncodeToString(prevMinerIDSig.Serialize()),

		MinerID:      minerID,
		Vctx:         v,
		MinerContact: mc,
	}

	return doc, nil
}

func createMinerIDOpReturn(height uint64, prevMinerIDPrivKey *bsvec.PrivateKey, minerIDPrivKey *bsvec.PrivateKey, vcTx string, mc minerContact) (string, error) {
	minerID := hex.EncodeToString(minerIDPrivKey.PubKey().SerializeCompressed())

	doc, err := createCoinbaseDocument(height, minerID, prevMinerIDPrivKey, vcTx, mc)
	if err != nil {
		return "", err
	}

	payload, err := json.Marshal(doc)
	if err != nil {
		return "", err
	}
	hash := sha256.Sum256([]byte(payload))
	signature, err := minerIDPrivKey.Sign(hash[:])
	if err != nil {
		return "", err
	}

	var parts [][]byte
	// 00
	parts = append(parts, []byte(protocolName))
	parts = append(parts, payload)
	parts = append(parts, []byte(hex.EncodeToString(signature.Serialize())))

	// If we have some data, make another output with an OP_RETURN for it.
	output, err := output.NewOpReturnParts(parts)
	// output, err := transaction.NewOutputOpReturnPush(parts)
	if err != nil {
		return "", err
	}

	return output.GetLockingScriptHexString(), nil
}

func main() {
	var h uint64 = 123
	// mid := "03f9d057f6ff6606f615302812db37f6eccdd531cdd2c321673af187cf7dbbb9ae"
	v := "11c9f0be55da88192f1b6538468975bcfc1635c48f1ce9eeae12cdaefc5a4c99"
	privKey, err := bsvec.NewPrivateKey(bsvec.S256())
	if err != nil {
		fmt.Println(err)
		return
	}
	prevPrivKey, err := bsvec.NewPrivateKey(bsvec.S256())
	if err != nil {
		fmt.Println(err)
		return
	}
	mc := minerContact{
		Name:                "demo",
		Email:               "demo@demo.com",
		MerchantAPIEndPoint: "api.demo.com",
	}

	// doc, err := createCoinbaseDocument(h, mid, privKey, v, mc)

	opr, err := createMinerIDOpReturn(h, prevPrivKey, privKey, v, mc)

	// fmt.Println(doc)
	fmt.Printf("%+v\n", opr)
}
