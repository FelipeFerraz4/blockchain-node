# Relatório da Primeira Sprint

## Atividade Individual: 
Desenvolver uma "rede blockchain" com funcionalidades básicas. O sistema deve permitir a ``criação de transações``, a ``inclusão delas em blocos``, a ``inserção desses blocos na rede`` e a ``validação da autenticidade``. O resultado dessas operações deve ser exportado por meio de logs no console. Além disso, o projeto deve garantir a integridade e validação da rede como um todo. A avaliação será estritamente técnica. Não se esqueçam de incluir uma documentação detalhada que explique como executar o projeto.

## Link de exemplo:
```bash
https://github.com/wandreus-muhl/task-manager
```

## Explicação da implementação

### Criação de Transações
A criação das transações foi implementada por meio da classe Transactions, que armazena as informações necessárias para registrar a transferência de valores entre os participantes da rede. A classe possui os seguintes parâmetros:
- **timestamp:** Representa o momento exato da criação da transação, armazenado como um valor numérico que indica a data e hora em milissegundos desde a época Unix.
- **fromAddress:** O endereço da pessoa ou entidade que está enviando o valor na transação. Esse parâmetro identifica o remetente da transação.
- **toAddress:** O endereço da pessoa ou entidade que está recebendo o valor. Esse parâmetro identifica o destinatário da transação.
- **value:** O valor monetário ou quantidade de ativos sendo transferidos na transação.
- **fee (adicionados posteriormente):** Uma taxa adicional opcional associada à transação. Esse valor pode ser utilizado para incentivar mineradores ou validadores a priorizar a transação na rede. O valor padrão é 0, caso não seja especificado.
- **signature(adicionados posteriormente):** A assinatura digital que pode ser gerada para autenticar a transação e garantir sua integridade. Inicialmente, o valor de signature é null, mas ela pode ser preenchida posteriormente durante o processo de validação da transação.

O código da classe Transactions fica assim:
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

export default Transactions;
```

### Inclusão das Transações no Bloco
A inclusão das transações em um bloco é realizada pela classe ``Block``, que agrupa as transações e as informações essenciais, como o hash do bloco anterior, o timestamp, o hash do bloco atual e o número de nonce. Esses componentes garantem a integridade e a sequência da blockchain, assegurando que as transações sejam validadas e processadas na ordem correta.

A classe ``Block`` possui os seguintes parâmetros:
- **timestamp:** Representa o momento exato da criação do bloco, armazenado como um valor numérico que indica a data e hora em milissegundos desde a época Unix.
- **lastHash:** O hash do bloco anterior, garantindo que os blocos estejam encadeados, formando uma sequência imutável.
- **balanceBook (adicionados posteriormente):** Uma lista contendo os saldos de todas as contas envolvidas nas transações, ordenada pelo endereço das contas. Esse parâmetro ajuda a registrar o estado atual das contas após a aplicação das transações do bloco.
- **data:** As transações que estão sendo agrupadas neste bloco.
- **nonce:** Um número utilizado no processo de mineração. Ele é ajustado durante a mineração do bloco para encontrar um hash válido, de acordo com a dificuldade da rede.
- **hash:** O hash gerado para o bloco atual, utilizado para identificar de forma única o bloco.

Funções da Classe Block:
- **calculateBlockHash():** Responsável por calcular o hash do bloco com base em diversos parâmetros, como o timestamp, o lastHash, o data, o nonce e o balanceBook. O hash é gerado utilizando o algoritmo sha256, o que garante a segurança e a imutabilidade do bloco.
- **formatTimestamp():** Formata o timestamp do bloco para uma string legível no formato ISO 8601, tornando o bloco mais fácil de ser interpretado por seres humanos.
O código da classe Block poderia ser assim:
- **mineBlock(difficulty):** Realiza o processo de mineração do bloco, que consiste em encontrar um hash válido de acordo com a dificuldade da rede. A dificuldade é representada pelo número de zeros iniciais exigidos no hash. O nonce é incrementado até que o hash do bloco atenda ao critério de dificuldade.


O código da classe Block:
```javascript
import crypto from "crypto";

class Block {
  constructor(timestamp, lastHash, data, balanceBook) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.balanceBook = Array.from(balanceBook.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    this.data = data;
    this.nonce = 0;
    this.hash = this.calculateBlockHash();
  }

  // Method to calculate the hash of the block
  calculateBlockHash() {
    return crypto
      .createHash("sha256")
      .update(
        this.timestamp +
          this.lastHash +
          JSON.stringify(this.data) +
          this.nonce +
          JSON.stringify(this.balanceBook)
      )
      .digest("hex");
  }

  // Method to format the timestamp into a readable ISO string format
  formatTimestamp() {
    const date = new Date(this.timestamp);
    return date.toISOString();
  }

  // Method to mine the block by solving the proof-of-work
  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== "0".repeat(difficulty)) {
      this.nonce++;
      this.hash = this.calculateBlockHash();
    }
  }
}

export default Block;

```
### Inserção dos Blocos na Blockchain
A inserção dos blocos na blockchain é feita pela classe Blockchain, que gerencia a cadeia de blocos e a validação da rede. Cada vez que um bloco é minerado e validado, ele é inserido na cadeia existente, formando uma sequência imutável de blocos, onde cada bloco contém um hash que faz referência ao bloco anterior.

A classe Blockchain contém os seguintes parâmetros:
- **chain:** Uma lista de blocos que compõem a blockchain.
- **addressBook (adicionados posteriormente):** Mapeia endereços registrados na blockchain, associando chaves públicas a endereços.
- **balanceBook (adicionados posteriormente):** Armazena o saldo de cada endereço na blockchain.
- **miningReward (adicionados posteriormente):** Recompensa dada ao minerador por adicionar um novo bloco à blockchain.
- **sourceAddress (adicionados posteriormente):** Endereço associado ao bloco gênese ou utilizado para transações iniciais.
- **difficulty:** Define a dificuldade de mineração, controlando a complexidade de encontrar um hash válido.
- **pendingTransactionPool:** Lista de transações pendentes, aguardando validação e inclusão em blocos.
- **chain:** Lista de blocos que formam a blockchain, com cada bloco referenciando o anterior, criando uma sequência imutável.

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
}
```

### Validação da autenticidade da Blockchain
A validação da autenticidade da ``blockchain`` é realizada por meio de um processo de verificação de integridade. Esse processo assegura que cada bloco tenha um hash válido e que o hash do bloco anterior seja corretamente referenciado no bloco atual. Além disso, as transações dentro de cada bloco são verificadas para garantir que as regras de consenso da rede sejam seguidas.

**Verificação do hash de cada bloco:** A cada iteração, o hash de um bloco é recalculado e comparado com o hash armazenado.
**Verificação do previousHash:** O hash do bloco anterior deve coincidir com o valor armazenado no bloco atual.
**Validação das transações (adicionados posteriormente):** Cada transação deve ser validada de acordo com as regras da rede.

```javascript
  // Method to validate the entire blockchain
  isBlockchainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      if (currentBlock.timestamp <= previousBlock.timestamp) {
        console.log(
          `Invalid timestamp at block ${i}, ${currentBlock.timestamp} is not greater than previous block's timestamp ${previousBlock.timestamp}`
        );
        return false;
      }
      if (currentBlock.lastHash !== previousBlock.hash) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateBlockHash()) {
        return false;
      }

      for (const transaction of currentBlock.data) {
        const publicKey = this.addressBook.get(transaction.fromAddress);
        if (
          transaction.fromAddress !== this.sourceAddress &&
          (!publicKey || !transaction.verifyTransaction(publicKey))
        ) {
          console.log(`Invalid transaction signature in block ${i}`);
          return false;
        }
      }
    }
    return true;
  }
```