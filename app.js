import Transactions from "./src/transactions.js";
import Blockchain from "./src/blockchain.js";
import KeyPair from "./src/keyPair.js";
import Node from "./src/node.js";

const keyPair1 = new KeyPair();

console.log("KeyPair1 Address:", keyPair1.address);

console.log("\nInicializando os blockchains e os nós");

const blockchain1 = new Blockchain(keyPair1);

const keyPair2 = blockchain1.createKeyPair();
const keyPair3 = blockchain1.createKeyPair();


const node1 = new Node(blockchain1);
const node2 = node1.createNode();
const node3 = node1.createNode();

node1.connectNode(node2);
node2.connectNode(node3);


node1.createTransaction(
  keyPair1.privateKey,
  keyPair1.address,
  keyPair2.address,
  10,
  1
);


node1.createTransaction(
  keyPair1.privateKey,
  keyPair1.address,
  keyPair3.address,
  20,
  2
);

node1.minePendingTransactions(keyPair1.privateKey, keyPair1.address);

console.log("\nEstado dos Node:");
console.log("\nNode 1:\n");
node1.blockchain.printBlockchain();
console.log("\nNode 2:\n");
node2.blockchain.printBlockchain();
console.log("\nNode 3:\n");
node3.blockchain.printBlockchain();

node2.createTransaction(
  keyPair2.privateKey,
  keyPair2.address,
  keyPair3.address,
  5,
  2
);

node3.minePendingTransactions(keyPair1.privateKey, keyPair1.address);

console.log("\nEstado dos Node:");
console.log("\nNode 1:\n");
node1.blockchain.printBlockchain();
console.log("\nNode 2:\n");
node2.blockchain.printBlockchain();
console.log("\nNode 3:\n");
node3.blockchain.printBlockchain();


node3.createTransaction(
  keyPair3.privateKey,
  keyPair3.address,
  keyPair2.address,
  8,
  2
);

node1.blockchain.chain.pop();

node3.minePendingTransactions(keyPair2.privateKey, keyPair2.address);

console.log("\nEstado dos Node:");
console.log("\nNode 1:\n");
node1.blockchain.printBlockchain();
console.log("\nNode 2:\n");
node2.blockchain.printBlockchain();
console.log("\nNode 3:\n");
node3.blockchain.printBlockchain();