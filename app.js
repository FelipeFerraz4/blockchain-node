import Transactions from "./src/transactions.js";
import Blockchain from "./src/blockchain.js";

const bitcoin = new Blockchain("address1");

bitcoin.createTransaction(new Transactions("address1", "address2", 10));
bitcoin.createTransaction(new Transactions("address1", "address3", 10));

bitcoin.minePendingTransactions("address2");
bitcoin.printBlockchain();
console.log(`Is Blockchain valid ? ${bitcoin.isBlockchainValid()}`);
