import crypto from "crypto";

class Transactions {
  constructor(fromAddress, toAddress, value, fee = 0) {
    this.timestamp = Date.now();
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.value = value;
    this.signature = null;
    this.fee = fee;
  }

  // Method to sign the transaction with the sender's private key
  signTransaction(privateKey) {
    const sign = crypto.createSign("SHA256");
    sign
      .update(
        this.timestamp +
          this.fromAddress +
          this.toAddress +
          this.value +
          this.fee
      )
      .end();
    this.signature = sign.sign(privateKey, "hex");
  }

  // Method to verify the transaction's signature using the sender's public key
  verifyTransaction(publicKey) {
    const verify = crypto.createVerify("SHA256");
    verify
      .update(
        this.timestamp +
          this.fromAddress +
          this.toAddress +
          this.value +
          this.fee
      )
      .end();
    return verify.verify(publicKey, this.signature, "hex");
  }
}

export default Transactions;