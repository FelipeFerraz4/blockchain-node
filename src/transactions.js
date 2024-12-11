import crypto from "crypto";

class Transactions {
  constructor(fromAddress, toAddress, value, free = 0) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.value = value;
    this.signature = null;
    this.fee = free
  }

  signTransaction(privateKey) {
    const sign = crypto.createSign("SHA256");
    sign.update(this.fromAddress + this.toAddress + this.value + this.fee).end();
    this.signature = sign.sign(privateKey, "hex");
  }

  verifyTransaction(publicKey) {
    const verify = crypto.createVerify("SHA256");
    verify
      .update(this.fromAddress + this.toAddress + this.value + this.fee)
      .end();
    return verify.verify(publicKey, this.signature, "hex");
  }
}

export default Transactions;