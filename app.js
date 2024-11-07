import Transactions from "./src/transactions.js";
import Blockchain from "./src/blockchain.js";
import KeyPair from "./src/keyPair.js";

const keyPair1 = new KeyPair();
console.log("Public Key: \n", keyPair1.publicKey);
console.log("Address: \n", keyPair1.address);

console.log("\n");

const bitcoin = new Blockchain(keyPair1.privateKey, keyPair1.address);

const keyPair2 = new KeyPair();
const keyPair3 = new KeyPair();

bitcoin.createTransaction(keyPair1.privateKey, keyPair1.address, keyPair2.address, 10);
bitcoin.createTransaction(keyPair1.privateKey, keyPair1.address, keyPair3.address, 10);

bitcoin.minePendingTransactions(keyPair2.privateKey, keyPair2.address);

bitcoin.printBlockchain();

console.log(`Is Blockchain valid ? ${bitcoin.isBlockchainValid()}`);

const history = bitcoin.getTransactionHistory(keyPair1.address);

console.log("\nHistory: ")
history.forEach((transaction) => {
  console.log(`   From Address: ${transaction.fromAddress}`);
  console.log(`   To Address: ${transaction.toAddress}`);
  console.log(`   Value: ${transaction.value}`);
});