import cloneDeep from "lodash/cloneDeep.js";

class Node {
  constructor(blockchain) {
    this.blockchain = blockchain;
    this.peers = new Set();
  }

  // Connect this node to another node, establishing a two-way connection
  connectNode(node) {
    this.peers.add(node);
    node.peers.add(this);
  }

  // Create a new node with a copy of the current blockchain
  createNode() {
    return new Node(cloneDeep(this.blockchain));
  }

  // Create a transaction and broadcast it to peers if valid
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

  // Mine pending transactions and broadcast the newly mined block to peers
  minePendingTransactions(privateKey, address) {
    const block = this.blockchain.minePendingTransactions(privateKey, address);
    if (block) {
      this.broadcastBlock(block);
    }
  }

  // Check if a block with the given hash exists in the blockchain
  containsBlock(blockHash) {
    return this.blockchain.chain.some((block) => block.hash === blockHash);
  }

  // Broadcast a block to peers if it is not already part of the blockchain
  broadcastBlock(block) {
    if (!this.containsBlock(block.hash)) {
      if (this.receiveBlock(block)) {
        this.peers.forEach((peer) => {
          peer.broadcastBlock(block);
        });
      }
    }
  }

  // Check if a transaction with the given signature exists in the pending transaction pool
  containsTransaction(transactionSignature) {
    return this.blockchain.pendingTransactionPool.some(
      (transaction) => transaction.signature === transactionSignature
    );
  }

  // Broadcast a transaction to peers if it is not already in the pending pool
  broadcastTransaction(transaction) {
    if (!this.containsTransaction(transaction.signature)) {
      if (this.receiveTransaction(transaction)) {
        this.peers.forEach((peer) => {
          peer.broadcastTransaction(transaction);
        });
      }
    }
  }

  // Receive a block from a peer and validate it before adding it to the blockchain
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

  // Receive a transaction from a peer and validate it before adding it to the pending pool
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

  // Update the balance of each address involved in a block's transactions
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

  // Remove transactions from the pool that are included in a block
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

  // Resolve conflicts by adopting the longest valid blockchain from peers
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

  // Propagate the longest valid blockchain to all peers
  propagateBlockchain(longestBlockchain) {
    if (this.synchronizeBlockchain(longestBlockchain)) {
      this.peers.forEach((peer) => {
        if (peer !== this) {
          peer.propagateBlockchain(longestBlockchain);
        }
      });
    }
  }

  // Synchronize the local blockchain with the longest valid blockchain from a peer
  synchronizeBlockchain(longestBlockchain) {
    if (longestBlockchain.chain.length <= this.blockchain.chain.length) {
      return false;
    }

    this.blockchain = cloneDeep(longestBlockchain);
    return true;
  }
}
export default Node;
