import Transactions from "./src/transactions.js";
import Blockchain from "./src/blockchain.js";
import KeyPair from "./src/keyPair.js";
import Node from "./src/node.js";

const keyPair1 = new KeyPair();

console.log("KeyPair1 Address:", keyPair1.address);

console.log("\nInicializando os blockchains e os nós");

const blockchain1 = new Blockchain(keyPair1);


const node1 = new Node(blockchain1);
const node2 = new Node(blockchain1);
const node3 = new Node(blockchain1);

const keyPair2 = node1.blockchain.createKeyPair();
const keyPair3 = node1.blockchain.createKeyPair();

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

// // Verificar o estado atualizado dos blockchains
// console.log("\nEstado atualizado dos blockchains:");
// console.log("Blockchain do nó 1:");
// blockchain1.printBlockchain();
// console.log("Blockchain do nó 2:");
// blockchain2.printBlockchain();
// console.log("Blockchain do nó 3:");
// blockchain3.printBlockchain();

// // Testar resolução de conflitos
// console.log("\nForçando um conflito e testando a resolução");
// blockchain1.chain.pop(); // Remove o último bloco do nó 1 para criar conflito
// node1.resolveConflicts();

// console.log("\nEstado dos blockchains após a resolução de conflitos:");
// console.log("Blockchain do nó 1:");
// blockchain1.printBlockchain();
// console.log("Blockchain do nó 2:");
// blockchain2.printBlockchain();
// console.log("Blockchain do nó 3:");
// blockchain3.printBlockchain();

// console.log("\nTestes finalizados!");
