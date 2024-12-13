# Relatório da Segunda Sprint

## Atividade Individual Solicitada: 
individual: incrementar a blockchain desenvolvida na última atividade. 
``adicionar um sistema de proof of work, com nonce e dificuldade``
``determinar a estrutura de um endereço válido (a critério próprio, ex: 2x + 48 caracteres hexadecimais)`` e ``garantir que uma transação só aconteça se todos os endereços envolvidos sejam válidos``
``implementar um histórico de transações por endereço``

## Explicação da implementação

### Histórico de Transações por Endereço
A funcionalidade de histórico de transações por endereço permite que o sistema recupere todas as transações associadas a um determinado endereço, seja como remetente (fromAddress) ou destinatário (toAddress). Isso é útil para consultar o histórico de transações de um usuário ou entidade na rede, proporcionando transparência e rastreabilidade das movimentações.

A implementação dessa funcionalidade foi feita por meio do método getTransactionHistory, que percorre todos os blocos na blockchain e filtra as transações relacionadas ao endereço fornecido. As transações encontradas são armazenadas em um array, que é retornado como o histórico completo de transações.

Funcionamento do método:
    1. O método percorre cada bloco na cadeia de blocos ``this.chain``.
    2. Para cada bloco, ele percorre as transações ``block.data``.
    3. Se o endereço fornecido for o remetente ``fromAddress`` ou o destinatário ``toAddress`` da transação, a transação é adicionada ao histórico.
    4. O histórico de transações é retornado ao final.

```javascript
// Method to get the transaction history of an address
getTransactionHistory(address) {
  const history = [];

  this.chain.forEach((block) => {
    block.data.forEach((transaction) => {
      if (
        transaction.fromAddress === address ||
        transaction.toAddress === address
      ) {
        history.push(transaction);
      }
    });
  });
  return history;
}
```

### Estrutura de um Endereço Válido
A funcionalidade para determinar a estrutura de um endereço válido foi implementada na classe KeyPair. A definição adotada para um endereço válido segue o formato:
Prefixo "0x" + 40 caracteres hexadecimais, gerados a partir da chave pública do usuário. Essa abordagem garante unicidade, segurança e conformidade com os padrões utilizados em redes blockchain.

A geração de um endereço ocorre por meio do método generateAddressFromKey, que aplica uma combinação de funções de hash (SHA-256 e RIPEMD-160) à chave pública, assegurando que os endereços sejam compactos e difíceis de falsificar.

Detalhes da Implementação:
- Geração da Chave Pública e Privada:
    - Utiliza a curva elíptica secp256k1, amplamente usada em blockchains como Bitcoin e Ethereum.
    - As chaves são geradas com o módulo crypto do Node.js e armazenadas em privateKey e publicKey.
- Criação do Endereço:
    - O método generateAddressFromKey realiza as seguintes etapas:
        - **SHA-256:** Gera um hash da chave pública, criando uma representação única.
        - **RIPEMD-160:** Compacta o hash SHA-256 para reduzir o tamanho e manter a unicidade.
        - Adiciona o ``prefixo "0x"`` ao hash resultante, indicando que se trata de um endereço válido.
Resultado Final:
    - O endereço gerado tem ``42 caracteres``: ``"0x" + 40 caracteres hexadecimais``.

```javascript
import crypto from 'crypto';

class KeyPair {
  constructor() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
      namedCurve: "secp256k1",
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
    });
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.address = this.generateAddressFromKey(publicKey);
  }

  // Method to generate an address from the public key using hashing techniques
  generateAddressFromKey(publicKey) {
    const sha256Hash = crypto.createHash("sha256").update(publicKey).digest();
    const ripemd160 = crypto
      .createHash("ripemd160")
      .update(sha256Hash)
      .digest("hex");

    const prefix = "0x00";

    return prefix.concat(ripemd160);
  }
}
```

### Validação de Endereços nas Transações
Para garantir que uma transação só ocorra se todos os endereços envolvidos forem válidos, foi implementada uma validação rigorosa por meio de dois métodos: isValidAddress e createTransaction. A funcionalidade assegura que as transações respeitem as regras de formatação dos endereços, evitando erros e fraudes na rede blockchain.

Detalhes da Implementação
    1. Validação de Endereços:
        - O método isValidAddress verifica se um endereço segue o formato esperado:
            - Deve começar com o prefixo "0x00".
            - Deve conter exatamente 40 caracteres hexadecimais após o prefixo.
            - Utiliza uma expressão regular para validar os caracteres hexadecimais.
    2. Criação de Transações:
        - O método createTransaction utiliza isValidAddress para validar os endereços de origem (fromAddress) e destino (toAddress) antes de criar a transação.
        - Adicionalmente, verifica se o saldo do endereço de origem é suficiente para cobrir o valor da transação e a taxa associada.
    3. Fluxo de Validação:
        - Se algum dos endereços for inválido, a criação da transação é interrompida, e uma mensagem de erro é exibida.
        - Apenas transações com endereços válidos e saldo suficiente são criadas e assinadas.

```javascript
// Method to check if an address is valid
isValidAddress(address) {
  const prefix = "0x00";
  if (!address.startsWith(prefix)) {
    return false;
  }

  const addressWithoutPrefix = address.slice(prefix.length);
  if (addressWithoutPrefix.length !== 40) {
    return false;
  }

  const hexRegex = /^[0-9a-fA-F]{40}$/;
  if (!hexRegex.test(addressWithoutPrefix)) {
    return false;
  }

  return true;
}

// Method to create a new transaction
createTransaction(privateKey, fromAddress, toAddress, value, fee = 0) {
  if (!this.isValidAddress(fromAddress)) {
    console.log("Transaction invalid: The 'from' address is invalid");
    return;
  }

  if (!this.isValidAddress(toAddress)) {
    console.log("Transaction invalid: The 'to' address is invalid");
    return;
  }

  const balance = this.balanceBook.get(fromAddress);
  if (fromAddress !== this.sourceAddress && balance < value + fee) {
    console.log("Transaction invalid: Insufficient balance");
    return;
  }

  const transaction = new Transactions(fromAddress, toAddress, value, fee);
  transaction.signTransaction(privateKey);

  return transaction;
}
```

### Implementação do Sistema de Proof of Work
O sistema de Proof of Work (PoW) foi adicionado para garantir a integridade e a segurança da blockchain. Esse mecanismo exige que um minerador resolva um problema computacional (encontrar um hash que atenda a um determinado critério de dificuldade) antes que um novo bloco possa ser adicionado à cadeia.

Detalhes da Implementação
    1. Mineração de Blocos:
        - O método minePendingTransactions é responsável por processar as transações pendentes, calcular as taxas associadas e criar um novo bloco.
        - Um novo bloco é minerado, incluindo as transações pendentes e a recompensa do minerador.
    2. Proof of Work:
        - Implementado no método mineBlock, o PoW utiliza um processo iterativo para calcular um hash do bloco que começa com uma quantidade específica de zeros, definida pela dificuldade da rede.
        - A variável nonce é incrementada continuamente até que a condição de dificuldade seja satisfeita.
    3. Recompensa e Taxas de Mineração:
        - O minerador recebe uma recompensa fixa (miningReward) e acumula as taxas de todas as transações incluídas no bloco.
    4. Fluxo de Mineração:
        - Valida as transações pendentes antes de iniciar o processo de mineração.
        - Gera um novo bloco contendo as transações validadas e o recompensa o minerador.
        - Aplica o algoritmo de PoW para resolver o problema computacional, validando o bloco.

Código na classe Blockchain
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

Código na classe Block
```javascript
  // Method to mine the block by solving the proof-of-work
  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== "0".repeat(difficulty)) {
      this.nonce++;
      this.hash = this.calculateBlockHash();
    }
  }
```