import crypto from 'crypto';
import KeyPair from './keyPair.js';
import Transactions from './transactions.js';
import Block from './block.js';

class Blockchain {
  constructor(keyPair) {
    this.miningReward = 100.0;
    this.sourceAddress = "0x000000000000000000000000000000000000000000";
    this.chain = [this.createGenesisBlock(keyPair.privateKey, keyPair.address)];
    this.difficulty = 4;
    this.pendingTransactionPool = [];
    this.addressBook = new Map();
    this.registerAddress(keyPair.publicKey, keyPair.address);
  }

  registerAddress(publicKey, address) {
    if (!this.isValidAddress(address)) {
      console.log("Invalid address format");
    } else {
      this.addressBook.set(address, publicKey);
    }
  }

  createKeyPair() {
    const keyPair = new KeyPair();
    this.registerAddress(keyPair.publicKey, keyPair.address);
    return keyPair;
  }

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
    return new Block(Date.now(), zeroHash, [genesisTransactions], 0);
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  createTransaction(privateKey, fromAddress, toAddress, value) {
    if (!this.isValidAddress(fromAddress)) {
      console.log("Transaction invalid: The 'from' address is invalid");
      return;
    }

    if (!this.isValidAddress(toAddress)) {
      console.log("Transaction invalid: The 'to' address is invalid");
      return;
    }

    const balance = this.getBalanceOfAddress(fromAddress);
    if (balance < value && fromAddress !== this.sourceAddress) {
      console.log("Transaction invalid: Insufficient balance");
      return;
    }

    const transaction = new Transactions(fromAddress, toAddress, value);
    transaction.signTransaction(privateKey);

    this.pendingTransactionPool.push(transaction);
  }

  minePendingTransactions(privateKey, miningRewardAddress) {
    this.validatePendingTransaction();

    this.createTransaction(
      privateKey,
      this.sourceAddress,
      miningRewardAddress,
      this.miningReward
    );

    let block = new Block(
      Date.now(),
      this.getLastBlock().hash,
      this.pendingTransactionPool
    );

    block.mineBlock(this.difficulty);

    this.chain.push(block);
  }

  isBlockchainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.timestamp <= previousBlock.timestamp) {
        console.log(`Invalid timestamp at block ${i}, ${currentBlock.timestamp} is not greater than previous block's timestamp ${previousBlock.timestamp}`);
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
        if (transaction.fromAddress !== this.sourceAddress &&
            (!publicKey || !transaction.verifyTransaction(publicKey))) {
              console.log(`Invalid transaction signature in block ${i}`);
              return false;
            }
      }

    }
    return true;
  }

  getBalanceOfAddress(address) {
    let balance = 0;

    this.chain.forEach((block) => {
      block.data.forEach((transaction) => {
        if (transaction.fromAddress === address) {
          balance -= transaction.value;
        }

        if (transaction.toAddress === address) {
          balance += transaction.value;
        }
      });
    });

    return balance;
  }

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

  validatePendingTransaction() {
    const validTransactions = [];
    this.pendingTransactionPool.forEach((transaction) => {
      const publicKey = this.addressBook.get(transaction.fromAddress);
      if (
        publicKey &&
        transaction.verifyTransaction(publicKey) &&
        this.getBalanceOfAddress(transaction.fromAddress) >= transaction.value
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
      });

      console.log(`\n`);
    });
  }
}

export default Blockchain;