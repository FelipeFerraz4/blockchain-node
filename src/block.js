import crypto from "crypto";

class Block {
  constructor(timestamp, lastHash, data, balanceBook) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.balanceBook = Array.from(balanceBook.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    this.data = data;
    this.nonce = 0;
    this.hash = this.calculateBlockHash();
  }

  // Method to calculate the hash of the block
  calculateBlockHash() {
    return crypto
      .createHash("sha256")
      .update(
        this.timestamp +
          this.lastHash +
          JSON.stringify(this.data) +
          this.nonce +
          JSON.stringify(this.balanceBook)
      )
      .digest("hex");
  }

  // Method to format the timestamp into a readable ISO string format
  formatTimestamp() {
    const date = new Date(this.timestamp);
    return date.toISOString();
  }

  // Method to mine the block by solving the proof-of-work
  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== "0".repeat(difficulty)) {
      this.nonce++;
      this.hash = this.calculateBlockHash();
    }
  }
}

export default Block;
