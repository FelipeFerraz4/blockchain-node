import cloneDeep from "lodash/cloneDeep.js";

class Node {
  constructor(blockchain) {
    this.blockchain = blockchain;
    this.peers = new Set();
  }

  connectNode(node) {
    this.peers.add(node);
    node.peers.add(this);
  }

  createNode() {
    return new Node(cloneDeep(this.blockchain));
  }

  createTransaction(privateKey, fromAddress, toAddress, value, fee = 0) {
    const transaction = this.blockchain.createTransaction(
      privateKey,
      fromAddress,
      toAddress,
      value,
      fee
    );
    if (transaction) {
      this.broadcastTransaction(transaction);
    }
  }

  minePendingTransactions(privateKey, address) {
    const block = this.blockchain.minePendingTransactions(privateKey, address);
    if (block) {
      this.broadcastBlock(block);
    }
  }

  containsBlock(blockHash) {
    return this.blockchain.chain.some((block) => block.hash === blockHash);
  }

  broadcastBlock(block) {
    if (!this.containsBlock(block.hash)) {
      if (this.receiveBlock(block)) {
        this.peers.forEach((peer) => {
          peer.broadcastBlock(block);
        });
      }
    }
  }

  containsTransaction(transactionSignature) {
    return this.blockchain.pendingTransactionPool.some(
      (transaction) => transaction.signature === transactionSignature
    );
  }

  broadcastTransaction(transaction) {
    if (!this.containsTransaction(transaction.signature)) {
      if (this.receiveTransaction(transaction)) {
        this.peers.forEach((peer) => {
          peer.broadcastTransaction(transaction);
        });
      }
    }
  }

  receiveBlock(block) {
    if (block.hash !== block.calculateBlockHash()) {
      console.log("Invalid block hash received!");
      return false;
    }

    const lastBlock = this.blockchain.getLastBlock();
    if (block.lastHash !== lastBlock.hash) {
      console.log("Blockchain fork detected!");
      this.resolveConflicts();
      return false;
    }

    this.blockchain.chain.push(block);

    if (!this.blockchain.isBlockchainValid()) {
      console.log("Blockchain invalid after adding block!");
      this.blockchain.chain.pop();
      return false;
    }

    this.updateBalanceBook(block);

    this.removeTransactionsFromPool(block);

    return true;
  }

  receiveTransaction(transaction) {
    const fromBalance = this.blockchain.balanceBook.get(
      transaction.fromAddress
    );
    if (fromBalance < transaction.value + transaction.fee) {
      console.log("Insufficient balance for the transaction!");
      return false;
    }

    const publicKey = this.blockchain.addressBook.get(transaction.fromAddress);
    if (!transaction.verifyTransaction(publicKey)) {
      console.log("Invalid transaction signature!");
      return false;
    }

    this.blockchain.pendingTransactionPool.push(transaction);
    return true;
  }

  updateBalanceBook(block) {
    block.data.forEach((transaction) => {
      const fromBalance = this.blockchain.balanceBook.get(
        transaction.fromAddress
      );
      this.blockchain.balanceBook.set(
        transaction.fromAddress,
        fromBalance - transaction.value
      );

      const toBalance =
        this.blockchain.balanceBook.get(transaction.toAddress) || 0;
      this.blockchain.balanceBook.set(
        transaction.toAddress,
        toBalance + transaction.value
      );
    });
  }

  removeTransactionsFromPool(block) {
    block.data.forEach((transaction) => {
      const transactionIndex = this.blockchain.pendingTransactionPool.findIndex(
        (tx) => tx.signature === transaction.signature
      );

      if (transactionIndex !== -1) {
        this.blockchain.pendingTransactionPool.splice(transactionIndex, 1);
      }
    });
  }

  resolveConflicts() {
    let longestBlockchain = this.blockchain;
    let maxLength = this.blockchain.chain.length;

    this.peers.forEach((peer) => {
      if (
        peer.blockchain.chain.length > maxLength &&
        peer.blockchain.isBlockchainValid()
      ) {
        longestBlockchain = peer.blockchain;
        maxLength = peer.blockchain.chain.length;
      }
    });

    if (longestBlockchain !== this.blockchain) {
      console.log("Replacing chain with the longest valid chain.");
      this.propagateBlockchain(longestBlockchain);
    }
  }

  propagateBlockchain(longestBlockchain) {
    if (this.synchronizeBlockchain(longestBlockchain)) {
      this.peers.forEach((peer) => {
        if (peer !== this) {
          peer.propagateBlockchain(longestBlockchain);
        }
      });
    }
  }

  synchronizeBlockchain(longestBlockchain) {
    if (longestBlockchain.chain.length <= this.blockchain.chain.length) {
      return false;
    }

    this.blockchain = cloneDeep(longestBlockchain);
    return true;
  }
}
export default Node;
