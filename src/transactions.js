import crypto from "crypto";

class Transactions {
  constructor(fromAddress, toAddress, value) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.value = value;
    this.signature = null;
  }

  signTransaction(privateKey) {
    const sign = crypto.createSign("SHA256");
    sign.update(this.fromAddress + this.toAddress + this.value).end();
    this.signature = sign.sign(privateKey, "hex");
  }
}

export default Transactions;