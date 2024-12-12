import cloneDeep from 'lodash/cloneDeep';

class Node {
    constructor(blockchain) {
      this.blockchain = blockchain;
      this.peers = new Set();
    }
  
    connectNode(node) {
      this.peers.add(node);
      node.peers.add(this);
    }
  
    containsBlock(blockHash) {
      return this.blockchain.chain.some(block => block.hash === blockHash);
    }
  
    
    broadcastBlock(block) {
        if (!this.containsBlock(block.hash)) {
            if (this.receiveBlock(block)) {
                this.peers.forEach(peer => {
                    peer.broadcastBlock(block);
                });
            }
        }
    }

    containsTransaction(transactionSignature) {
      return this.blockchain.pendingTransactionPool.some(
        transaction => transaction.signature === transactionSignature
      );
    }
    
    broadcastTransaction(transaction) {
      if (!this.containsTransaction(transaction.signature)) {
        if (this.receiveTransaction(transaction)) {
          this.peers.forEach(peer => {
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
      const fromBalance = this.blockchain.balanceBook.get(transaction.fromAddress);
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
      block.data.forEach(transaction => {
        const fromBalance = this.blockchain.balanceBook.get(transaction.fromAddress);
        this.blockchain.balanceBook.set(
        transaction.fromAddress,
        fromBalance - transaction.value - transaction.fee
        );

        const toBalance = this.blockchain.balanceBook.get(transaction.toAddress);
        this.blockchain.balanceBook.set(
        transaction.toAddress,
        toBalance + transaction.value
        );
      });
    }

    removeTransactionsFromPool(block) {
      block.data.forEach(transaction => {
        const transactionIndex = this.blockchain.pendingTransactionPool.findIndex(
            tx => tx.signature === transaction.signature
        );
        
        if (transactionIndex !== -1) {
            this.blockchain.pendingTransactionPool.splice(transactionIndex, 1);
        }
      });
    }

    resolveConflicts() {
      let longestChain = this.blockchain.chain;
      let maxLength = longestChain.length;

      this.peers.forEach(peer => {
        if (peer.blockchain.chain.length > maxLength && peer.blockchain.isBlockchainValid()) {
          longestChain = peer.blockchain.chain;
          maxLength = peer.blockchain.chain.length;
        }
      });

      if (longestChain !== this.blockchain.chain) {
        console.log("Replacing chain with the longest valid chain.");
        this.blockchain.chain = cloneDeep(longestChain);
        this.propagateBlockchain(longestChain);
      }
    }

    propagateBlockchain(newChain) {
        if (this.synchronizeBlockchain(newChain)) {
            this.peers.forEach(peer => {
                if (peer !== this) {
                    peer.propagateBlockchain(newChain);
                }
            });
        }
    }

    synchronizeBlockchain(newChain) {
      if (!this.blockchain.isValidChain(newChain)) {
        console.log("Cadeia recebida é inválida.");
        return false;
      }

      if (newChain.length <= this.blockchain.chain.length) {
        console.log("Cadeia recebida não é mais longa que a atual.");
        return false;
      }

      this.blockchain.chain = cloneDeep(newChain);
      return true;
    }
    
}
export default Node;