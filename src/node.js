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

}
export default Node;