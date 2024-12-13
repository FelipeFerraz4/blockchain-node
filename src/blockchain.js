import KeyPair from './keyPair.js';
import Transactions from './transactions.js';
import Block from './block.js';

class Blockchain {
  constructor(keyPair) {
    this.addressBook = new Map();
    this.balanceBook = new Map();
    this.registerAddress(keyPair.publicKey, keyPair.address);
    this.miningReward = 100.0;
    this.sourceAddress = "0x000000000000000000000000000000000000000000";
    this.difficulty = 4;
    this.pendingTransactionPool = [];
    this.chain = [this.createGenesisBlock(keyPair.privateKey, keyPair.address)];
  }

  // Method to register an address and its associated public key and balance
  registerAddress(publicKey, address) {
    if (!this.isValidAddress(address)) {
      console.log("Invalid address format");
    } else {
      this.addressBook.set(address, publicKey);
      this.balanceBook.set(address, 0.0);
    }
  }

  // Method to create a new key pair (public/private keys) and register the address
  createKeyPair() {
    const keyPair = new KeyPair();
    this.registerAddress(keyPair.publicKey, keyPair.address);
    return keyPair;
  }

  // Method to create the genesis block (first block in the blockchain)
  createGenesisBlock(privateKey, miningRewardAddress) {
    if (!this.isValidAddress(miningRewardAddress)) {
      console.log("Transaction invalid: The address is invalid");
      return;
    }

    const zeroHash =
      "0000000000000000000000000000000000000000000000000000000000000000";
    const genesisTransactions = new Transactions(
      this.sourceAddress,
      miningRewardAddress,
      this.miningReward
    );
    genesisTransactions.signTransaction(privateKey);
    this.balanceBook.set(
      miningRewardAddress,
      this.balanceBook.get(miningRewardAddress) + this.miningReward
    );
    return new Block(
      Date.now(),
      zeroHash,
      [genesisTransactions],
      this.balanceBook
    );
  }

  // Method to get the last block in the chain
  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Method to create a new transaction
  createTransaction(privateKey, fromAddress, toAddress, value, fee = 0) {
    if (!this.isValidAddress(fromAddress)) {
      console.log("Transaction invalid: The 'from' address is invalid");
      return;
    }

    if (!this.isValidAddress(toAddress)) {
      console.log("Transaction invalid: The 'to' address is invalid");
      return;
    }

    const balance = this.balanceBook.get(fromAddress);
    if (fromAddress !== this.sourceAddress && balance < value + fee) {
      console.log("Transaction invalid: Insufficient balance");
      return;
    }

    const transaction = new Transactions(fromAddress, toAddress, value, fee);
    transaction.signTransaction(privateKey);

    return transaction;
  }

  // Method to mine pending transactions and create a new block
  minePendingTransactions(privateKey, miningRewardAddress) {
    this.validatePendingTransaction();

    const totalFees = this.pendingTransactionPool.reduce(
      (acc, transaction) => acc + transaction.fee,
      0
    );

    const transaction = this.createTransaction(
      privateKey,
      this.sourceAddress,
      miningRewardAddress,
      this.miningReward + totalFees
    );

    const transactions = [...this.pendingTransactionPool, transaction];

    const block = new Block(
      Date.now(),
      this.getLastBlock().hash,
      transactions,
      this.balanceBook
    );

    block.mineBlock(this.difficulty);

    return block;
  }

  // Method to validate the entire blockchain
  isBlockchainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      if (currentBlock.timestamp <= previousBlock.timestamp) {
        console.log(
          `Invalid timestamp at block ${i}, ${currentBlock.timestamp} is not greater than previous block's timestamp ${previousBlock.timestamp}`
        );
        return false;
      }
      if (currentBlock.lastHash !== previousBlock.hash) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateBlockHash()) {
        return false;
      }

      for (const transaction of currentBlock.data) {
        const publicKey = this.addressBook.get(transaction.fromAddress);
        if (
          transaction.fromAddress !== this.sourceAddress &&
          (!publicKey || !transaction.verifyTransaction(publicKey))
        ) {
          console.log(`Invalid transaction signature in block ${i}`);
          return false;
        }
      }
    }
    return true;
  }

  // Method to check if an address is valid
  isValidAddress(address) {
    const prefix = "0x00";
    if (!address.startsWith(prefix)) {
      return false;
    }

    const addressWithoutPrefix = address.slice(prefix.length);
    if (addressWithoutPrefix.length !== 40) {
      return false;
    }

    const hexRegex = /^[0-9a-fA-F]{40}$/;
    if (!hexRegex.test(addressWithoutPrefix)) {
      return false;
    }

    return true;
  }

  // Method to get the transaction history of an address
  getTransactionHistory(address) {
    const history = [];

    this.chain.forEach((block) => {
      block.data.forEach((transaction) => {
        if (
          transaction.fromAddress === address ||
          transaction.toAddress === address
        ) {
          history.push(transaction);
        }
      });
    });
    return history;
  }

  // Method to validate pending transactions (verifying signatures and balance)
  validatePendingTransaction() {
    const validTransactions = [];
    this.pendingTransactionPool.forEach((transaction) => {
      const publicKey = this.addressBook.get(transaction.fromAddress);
      const totalCost = transaction.value + transaction.fee;
      if (
        publicKey &&
        transaction.verifyTransaction(publicKey) &&
        this.balanceBook.get(transaction.fromAddress) >= totalCost
      ) {
        validTransactions.push(transaction);
      } else {
        console.log(
          `Invalid Transaction from ${transaction.fromAddress} to ${transaction.toAddress}`
        );
      }
    });
    this.pendingTransactionPool = validTransactions;
  }

  // Method to print the details of the entire blockchain
  printBlockchain() {
    this.chain.forEach((block) => {
      console.log(
        `Block\n` +
          `Nonce: ${block.nonce}\n` +
          `Hash: ${block.hash}\n` +
          `Timestamp: ${block.formatTimestamp()}\n` +
          `Last Hash: ${block.lastHash}\n` +
          `Transactions:`
      );

      block.data.forEach((transaction) => {
        console.log(`   From Address: ${transaction.fromAddress}`);
        console.log(`   To Address: ${transaction.toAddress}`);
        console.log(`   Value: ${transaction.value}`);
        console.log(`   Fee: ${transaction.fee || 0}`);
        console.log(`   Signature: ${transaction.signature}`);
        console.log("\n");
      });
    });

    this.balanceBook.forEach((value, key) => {
      if (key !== this.sourceAddress) {
        console.log(`Address: ${key} -> Balance: ${value}`);
      }
    });
  }
}

export default Blockchain;

