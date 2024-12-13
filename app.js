import Blockchain from "./src/blockchain.js";
import KeyPair from "./src/keyPair.js";
import Node from "./src/node.js";

// Creating a new KeyPair instance for the first user
const keyPair1 = new KeyPair();

console.log("KeyPair1 Address:", keyPair1.address);

console.log("\nInicializando os blockchains e os nós");

// Creating the first blockchain with keyPair1 as the creator
const blockchain1 = new Blockchain(keyPair1);

// Creating additional key pairs for other users (keyPair2 and keyPair3)
const keyPair2 = blockchain1.createKeyPair();
const keyPair3 = blockchain1.createKeyPair();

// Creating the first node, then creating two more nodes by cloning the blockchain
const node1 = new Node(blockchain1);
const node2 = node1.createNode();
const node3 = node1.createNode();

// Connecting node1 with node2 and node2 with node3 to form a network
node1.connectNode(node2);
node2.connectNode(node3);

// Creating a transaction from keyPair1 to keyPair2 with a value of 10 and a fee of 1
node1.createTransaction(
  keyPair1.privateKey,
  keyPair1.address,
  keyPair2.address,
  10,
  1
);

// Creating another transaction from keyPair1 to keyPair3 with a value of 20 and a fee of 2
node1.createTransaction(
  keyPair1.privateKey,
  keyPair1.address,
  keyPair3.address,
  20,
  2
);

// Mining the pending transactions for node1, which will add a block to its blockchain
node1.minePendingTransactions(keyPair1.privateKey, keyPair1.address);

// Output the current state of the blockchains of all three nodes
console.log("\nEstado dos Node:");
console.log("\nNode 1:\n");
node1.blockchain.printBlockchain();
console.log("\nNode 2:\n");
node2.blockchain.printBlockchain();
console.log("\nNode 3:\n");
node3.blockchain.printBlockchain();

// Creating a transaction from keyPair2 to keyPair3 with a value of 5 and a fee of 2 for node2
node2.createTransaction(
  keyPair2.privateKey,
  keyPair2.address,
  keyPair3.address,
  5,
  2
);

// Mining the pending transactions for node3, adding a block to node3's blockchain
node3.minePendingTransactions(keyPair1.privateKey, keyPair1.address);

// Output the state of the blockchains of all three nodes again
console.log("\nEstado dos Node:");
console.log("\nNode 1:\n");
node1.blockchain.printBlockchain();
console.log("\nNode 2:\n");
node2.blockchain.printBlockchain();
console.log("\nNode 3:\n");
node3.blockchain.printBlockchain();

// Creating a transaction from keyPair3 to keyPair2 with a value of 8 and a fee of 2 for node3
node3.createTransaction(
  keyPair3.privateKey,
  keyPair3.address,
  keyPair2.address,
  8,
  2
);

// Simulating a blockchain fork by removing the last block from node1's blockchain
node1.blockchain.chain.pop();

// Mining the pending transactions for node3, which adds a block to node3's blockchain
node3.minePendingTransactions(keyPair2.privateKey, keyPair2.address);

// Output the final state of the blockchains for all three nodes
console.log("\nEstado dos Node:");
console.log("\nNode 1:\n");
node1.blockchain.printBlockchain();
console.log("\nNode 2:\n");
node2.blockchain.printBlockchain();
console.log("\nNode 3:\n");
node3.blockchain.printBlockchain();