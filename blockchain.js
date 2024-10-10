class Transactions{
    constructor(fromAddresss, toAddress, value){
        this.fromAddresss = fromAddresss;
        this.toAddress = toAddress;
        this.value = value; 
    }
} 

// pendingTransactionPool
class Block{
    constructor(timestamp, lastHash, hash, data, nonce){
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
    }
}

class Blockchain{
    constructor(){
        this.chain = [];
        this.difficulty = 4;
        this.pendingTransactionPool = [];
        this.miningReward = 100;
    }
}