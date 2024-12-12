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

    
}
export default Node;