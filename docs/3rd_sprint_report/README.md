# Relatório da Terceira Sprint

## Atividade Individual Solicitada: 
1. ``Propagação de Blocos e Transações``
    Imagine que cada nó na rede tem sua própria cópia da blockchain. Quando um novo bloco ou transação é criado, ele precisa ser compartilhado com os outros nós. Essa comunicação é essencial para manter a blockchain sincronizada.
    - Tarefa: Criar uma função que simula essa troca de informações entre os nós.
2. ``Resolução de Conflitos (Forks)``
    Em uma rede real, às vezes surgem dois blocos “competindo” para serem o próximo na cadeia. Isso gera um fork. Para resolver esse conflito, usamos uma regra simples: a cadeia mais longa vence.
    - Tarefa: Quando um nó detecta um fork, ele deve:
        1. Comparar as cadeias recebidas.
        2. Adotar a cadeia mais longa como válida.
3. ``Estado Global e Controle de Saldos``
    Agora é hora de dar mais significado aos endereços que vocês criaram. Cada endereço terá um saldo, e as transações devem obedecer a essa regra básica: ninguém pode gastar mais do que possui.
    - Tarefa:
        1. Adicionar um sistema para rastrear os saldos de cada endereço.
        2. Atualizar os saldos sempre que um bloco for minerado e incluído na cadeia.
4. ``Taxas de Transação e Recompensas``
    Para tornar a mineração mais interessante, vamos adicionar taxas às transações. Essas taxas serão somadas à recompensa que o minerador já recebe por cada bloco minerado.
    - Tarefa:
        1. Adicionar um campo taxa às transações.
        2. Modificar a lógica de mineração para somar todas as taxas das transações do bloco à recompensa do minerador.
    - Dica: Pense nas taxas como um incentivo extra para os mineradores escolherem transações específicas.

## Explicação da implementação

### Implementação da Propagação de Blocos
A funcionalidade de Propagação de Blocos permite que novos blocos sejam compartilhados entre os nós da rede para garantir a sincronização da blockchain. Essa propagação é feita de forma descentralizada, com validação de integridade em cada nó antes de adicionar o bloco à cadeia.

Detalhes da Implementação
1. **Propagação de Blocos ``broadcastBlock``:**
    - O método verifica se o bloco recebido já faz parte da blockchain do nó.
    - Se o bloco ainda não está na cadeia, ele é validado e adicionado.
    - Após a validação e adição bem-sucedida, o bloco é retransmitido para outros pares.
2. **Validação do Bloco Recebido ``receiveBlock``:**
    - Verifica se o hash do bloco recebido corresponde ao hash calculado localmente.
    - Garante que o hash do último bloco armazenado no nó corresponde ao hash do bloco anterior informado no novo bloco.
    - Valida toda a blockchain para assegurar consistência após a inclusão do novo bloco.
    - Atualiza o livro-razão de saldos e remove transações pendentes já incluídas no bloco.
3. **Verificação de Existência do Bloco ``containsBlock``:**
    - Método auxiliar que determina se um bloco específico já está armazenado no nó.
4. **Fluxo de Resolução de Conflitos ``resolveConflicts``:**
    - Invocado em caso de detecção de bifurcação ``fork`` na blockchain. Esse fluxo não foi detalhado aqui, mas geralmente sincroniza a cadeia com base na versão mais longa ou válida.

```javascript
  // Check if a block with the given hash exists in the blockchain
  containsBlock(blockHash) {
    return this.blockchain.chain.some((block) => block.hash === blockHash);
  }

  // Broadcast a block to peers if it is not already part of the blockchain
  broadcastBlock(block) {
    if (!this.containsBlock(block.hash)) {
      if (this.receiveBlock(block)) {
        this.peers.forEach((peer) => {
          peer.broadcastBlock(block);
        });
      }
    }
  }

  // Receive a block from a peer and validate it before adding it to the blockchain
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
```

### Implementação da Propagação de Transações
A funcionalidade de Propagação de Transações assegura que as transações pendentes sejam compartilhadas entre os nós da rede, permitindo que todos estejam cientes das transações que aguardam confirmação (mineração). Este recurso é fundamental para manter a rede sincronizada e eficiente.

Detalhes da Implementação
1. **Propagação de Transações ``broadcastTransaction``:**
    - Verifica se uma transação já está no pool de transações pendentes do nó.
    - Se a transação não estiver presente, ela é validada e adicionada ao pool.
    - Após a validação, a transação é retransmitida para outros pares.
2. **Validação da Transação Recebida ``receiveTransaction``:**
    - Garante que o saldo do endereço remetente é suficiente para cobrir o valor e a taxa da transação.
    - Verifica a autenticidade da assinatura da transação usando a chave pública associada ao endereço remetente.
    - Se válida, a transação é adicionada ao pool de transações pendentes.
3. **Verificação de Existência da Transação ``containsTransaction``:**
    - Método auxiliar que verifica se uma transação específica, identificada pela assinatura, já existe no pool de transações pendentes.

```javascript
  // Check if a transaction with the given signature exists in the pending transaction pool
  containsTransaction(transactionSignature) {
    return this.blockchain.pendingTransactionPool.some(
      (transaction) => transaction.signature === transactionSignature
    );
  }

  // Broadcast a transaction to peers if it is not already in the pending pool
  broadcastTransaction(transaction) {
    if (!this.containsTransaction(transaction.signature)) {
      if (this.receiveTransaction(transaction)) {
        this.peers.forEach((peer) => {
          peer.broadcastTransaction(transaction);
        });
      }
    }
  }

  // Receive a transaction from a peer and validate it before adding it to the pending pool
  receiveTransaction(transaction) {
    const fromBalance = this.blockchain.balanceBook.get(
      transaction.fromAddress
    );
    if (fromBalance < transaction.value + transaction.fee) {
      console.log("Insufficient balance for the transaction!");
      return false;
    }

    const publicKey = this.blockchain.addressBook.get(transaction.fromAddress);
    if (!transaction.verifyTransaction(publicKey)) {
      console.log("Invalid transaction signature!");
      return false;
    }

    this.blockchain.pendingTransactionPool.push(transaction);
    return true;
  }
```

### Implementação da Resolução de Conflitos (Forks)
A funcionalidade de Resolução de Conflitos (Forks) é essencial em blockchains descentralizadas, pois garante que todos os nós estejam alinhados com a versão mais confiável da cadeia. Isso é feito ao adotar a blockchain válida mais longa disponível na rede, uma prática comum para resolver forks.

Detalhes da Implementação:
1. **Resolver Conflitos ``resolveConflicts``**:
    - Verifica a blockchain de cada par ``peer``.
    - Identifica a blockchain válida mais longa entre os pares.
    - Se necessário, substitui a blockchain local pela mais longa.
2. **Propagar a Blockchain Atualizada ``propagateBlockchain``:**
    - Após adotar a blockchain mais longa, sincroniza os pares para garantir que todos utilizem a mesma cadeia.
3. **Sincronizar Blockchain Local ``synchronizeBlockchain``:**
    - Atualiza a blockchain local se a nova cadeia for válida e mais longa que a atual.
    - Utiliza uma abordagem imutável para evitar conflitos internos durante a atualização.

```javascript
  // Resolve conflicts by adopting the longest valid blockchain from peers
  resolveConflicts() {
    let longestBlockchain = this.blockchain;
    let maxLength = this.blockchain.chain.length;

    this.peers.forEach((peer) => {
      if (
        peer.blockchain.chain.length > maxLength &&
        peer.blockchain.isBlockchainValid()
      ) {
        longestBlockchain = peer.blockchain;
        maxLength = peer.blockchain.chain.length;
      }
    });

    if (longestBlockchain !== this.blockchain) {
      console.log("Replacing chain with the longest valid chain.");
      this.propagateBlockchain(longestBlockchain);
    }
  }

  // Propagate the longest valid blockchain to all peers
  propagateBlockchain(longestBlockchain) {
    if (this.synchronizeBlockchain(longestBlockchain)) {
      this.peers.forEach((peer) => {
        if (peer !== this) {
          peer.propagateBlockchain(longestBlockchain);
        }
      });
    }
  }

  // Synchronize the local blockchain with the longest valid blockchain from a peer
  synchronizeBlockchain(longestBlockchain) {
    if (longestBlockchain.chain.length <= this.blockchain.chain.length) {
      return false;
    }

    this.blockchain = cloneDeep(longestBlockchain);
    return true;
  }
```

### Implementação de Estado Global e Controle de Saldos
O Estado Global e Controle de Saldos é um aspecto crucial em blockchains, pois garante que cada transação seja validada em relação ao saldo atual das contas envolvidas. Esse controle previne gastos duplos e mantém a integridade da rede.

Detalhes da Implementação:
1. **Estrutura Inicial:**
    - A classe Blockchain contém um balanceBook, que é um mapa responsável por rastrear os saldos de todos os endereços.
    - Um addressBook também é mantido para associar chaves públicas a endereços.
2. **Atualização de Saldos ``updateBalanceBook``:**
    - Cada transação em um bloco ajusta o saldo do remetente e do destinatário.
    - Transações inválidas (por exemplo, com saldo insuficiente) são descartadas antes de serem mineradas.

Classe Blockchain -> ``construtor``
```javascript
class Blockchain {
  constructor(keyPair) {
    this.addressBook = new Map();
    this.balanceBook = new Map();
    this.registerAddress(keyPair.publicKey, keyPair.address);
    this.miningReward = 100.0;
    this.sourceAddress = "0x000000000000000000000000000000000000000000";
    this.difficulty = 4;
    this.pendingTransactionPool = [];
    this.chain = [this.createGenesisBlock(keyPair.privateKey, keyPair.address)];
  }

  // Method to register an address and its associated public key and balance
  registerAddress(publicKey, address) {
    if (!this.isValidAddress(address)) {
      console.log("Invalid address format");
    } else {
      this.addressBook.set(address, publicKey);
      this.balanceBook.set(address, 0.0);
    }
  }
}
```

Classe Node
```javascript
  // Update the balance of each address involved in a block's transactions
  updateBalanceBook(block) {
    block.data.forEach((transaction) => {
      const fromBalance = this.blockchain.balanceBook.get(
        transaction.fromAddress
      );
      this.blockchain.balanceBook.set(
        transaction.fromAddress,
        fromBalance - transaction.value
      );

      const toBalance =
        this.blockchain.balanceBook.get(transaction.toAddress) || 0;
      this.blockchain.balanceBook.set(
        transaction.toAddress,
        toBalance + transaction.value
      );
    });
  }
```

### Implementação de Taxas de Transação e Recompensas
Adicionando taxas às transações, é possível recompensar os mineradores de forma justa pelo processamento de transações. Isso cria um incentivo adicional além da recompensa por bloco minerado.

Detalhes da Implementação:
    1. **Adicionando a Taxa na Transação:**
        - Cada transação pode incluir uma taxa ``fee``, que será adicionada ao bloco e destinada ao minerador.
    2. **Cálculo das Taxas Totais:**
        - Antes de minerar um bloco, as taxas de todas as transações pendentes são somadas.
    3. **Recompensa do Minerador:**
        - A recompensa do minerador inclui tanto a recompensa fixa ``miningReward`` quanto as taxas totais coletadas.

Classe Blockchain
```javascript
  // Method to mine pending transactions and create a new block
  minePendingTransactions(privateKey, miningRewardAddress) {
    this.validatePendingTransaction();

    const totalFees = this.pendingTransactionPool.reduce(
      (acc, transaction) => acc + transaction.fee,
      0
    );

    const transaction = this.createTransaction(
      privateKey,
      this.sourceAddress,
      miningRewardAddress,
      this.miningReward + totalFees
    );

    const transactions = [...this.pendingTransactionPool, transaction];

    const block = new Block(
      Date.now(),
      this.getLastBlock().hash,
      transactions,
      this.balanceBook
    );

    block.mineBlock(this.difficulty);

    return block;
  }
```

Classe Transaction
```javascript
class Transactions {
  constructor(fromAddress, toAddress, value, fee = 0) {
    this.timestamp = Date.now();
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.value = value;
    this.signature = null;
    this.fee = fee;
  }
}
```