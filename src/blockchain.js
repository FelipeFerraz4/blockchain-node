import crypto from 'crypto';
import KeyPair from './keyPair.js';
import Transactions from './transactions.js';
import Block from './block.js';

class Blockchain {
    constructor(Address) {
        this.miningReward = 100.00;
        this.chain = [this.createGenesisBlock(Address)];
        this.difficulty = 4;
        this.pendingTransactionPool = [];
    }

    createGenesisBlock(miningRewardAddress) {
        const zeroHash = '0000000000000000000000000000000000000000000000000000000000000000';
        const genesisTrasactions = new Transactions('Origem', miningRewardAddress, this.miningReward)
        return new Block(Date.now(), zeroHash, [genesisTrasactions], 0);
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1]
    }

    createTransaction(transaction) {
        const balance = this.getBalanceOfAddress(transaction.fromAddress);
        if (balance < transaction.value){
            console.log('Transaction invalid');
        } else {
            this.pendingTransactionPool.push(transaction);
            // console.log('Transaction valid\n');
        }
    }

    minePendingTransactions(miningRewardAddress) {
        this.pendingTransactionPool.push(new Transactions('Origem', miningRewardAddress, this.miningReward));

        let block = new Block(Date.now(), this.getLastBlock().hash, this.pendingTransactionPool);
        
        block.mineBlock(this.difficulty);

        this.chain.push(block);
    }

    isBlockchainValid() {
        for(let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.lastHash !== previousBlock.hash) {
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateBlockHash()) {
                return false;
            }
        }
        return true;
    }

    getBalanceOfAddress(address) {
        let balance = 0;
    
        this.chain.forEach(block => {
            block.data.forEach(transaction => {
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

    printBlockchain() {
        this.chain.forEach(block => {
            console.log(`Block\n` +
            `Nonce: ${block.nonce}\n`+
            `Hash: ${block.hash}\n`+
            `Timestamp: ${block.formatTimestamp()}\n`+ 
            `Last Hash: ${block.lastHash}\n`+
            `Transactions:`);
    
            block.data.forEach(transaction => {
                console.log(`   From Address: ${transaction.fromAddress}`);
                console.log(`   To Address: ${transaction.toAddress}`);
                console.log(`   Value: ${transaction.value}`);
            });

            console.log(`\n`)
        });
    }
}

export default Blockchain;
