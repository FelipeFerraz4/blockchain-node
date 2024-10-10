import crypto from 'crypto';

class Transactions {
    constructor(fromAddress, toAddress, value) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.value = value; 
    }
} 

class Block {
    constructor(timestamp, lastHash, data, nonce) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = this.calculateBlockHash();
        this.data = data;
        this.nonce = nonce;
    }

    calculateBlockHash() {
        return crypto.createHash('sha256').update(
            this.timestamp + this.lastHash + JSON.stringify(this.data) + this.nonce
        ).digest('hex');
    }

    formatTimestamp() {
        const date = new Date(this.timestamp);
        return date.toISOString(); // Formato ISO 8601
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4;
        this.pendingTransactionPool = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        const zeroHash = '0000000000000000000000000000000000000000000000000000000000000000';
        return new Block(Date.now(), zeroHash, [], 0);
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1]
    }

    printBlockchain() {
        this.chain.forEach(block => {
            console.log(`Block Nonce: ${block.nonce}\n`+
            `Hash: ${block.hash}\n`+
            `Timestamp: ${block.formatTimestamp()}\n`+ 
            `Last Hash: ${block.lastHash}\n`+
            `Transactions:`);
    
            block.data.forEach(transaction => {
                console.log(`From Address: ${transaction.fromAddress}`);
                console.log(`To Address: ${transaction.toAddress}`);
                console.log(`Value: ${transaction.value}`);
            });

            console.log(`\n`)
        });
    }
}

const bitcoin = new Blockchain();
bitcoin.printBlockchain();
