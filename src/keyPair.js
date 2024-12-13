import crypto from 'crypto';

class KeyPair {
  constructor() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
      namedCurve: "secp256k1",
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
    });
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.address = this.generateAddressFromKey(publicKey);
  }

  // Method to generate an address from the public key using hashing techniques
  generateAddressFromKey(publicKey) {
    const sha256Hash = crypto.createHash("sha256").update(publicKey).digest();
    const ripemd160 = crypto
      .createHash("ripemd160")
      .update(sha256Hash)
      .digest("hex");

    const prefix = "0x00";

    return prefix.concat(ripemd160);
  }

  // Method to sign a transaction using the private key
  signTransaction(transaction) {
    const sign = crypto.createSign("SHA256");
    sign
      .update(
        transaction.fromAddress +
          transaction.toAddress +
          transaction.value +
          transaction.fee
      )
      .end();
    transaction.signature = sign.sign(this.privateKey, "hex");
  }

  // Method to verify the signature of a transaction using the public key
  verifyTransaction(transaction) {
    const verify = crypto.createVerify("SHA256");
    verify
      .update(
        transaction.fromAddress +
          transaction.toAddress +
          transaction.value +
          transaction.fee
      )
      .end();
    return verify.verify(this.publicKey, transaction.signature, "hex");
  }
}

export default KeyPair;