# Blockchain

Projeto de simulação de blockchain utilizando Node.js. O objetivo é criar uma blockchain simples, incluindo o mecanismo de proof-of-work, transações e verificação de integridade da cadeia de blocos.

## Tecnologias Utilizadas

- **Node.js:** Plataforma de execução do JavaScript.
- **Crypto:** Módulo nativo para criar hashes SHA-256.

## Funcionalidades

Este projeto permite:
- Criar uma blockchain com bloco gênesis.
- Adicionar transações à pool de transações pendentes.
- Minerar blocos utilizando proof-of-work com ajuste de dificuldade.
- Validar a integridade da blockchain.
- Consultar o saldo de endereços específicos.

## Pré-requisitos

- Node.js
- Git

## Instalação

1. Clone o repositório para sua máquina local:
    ```bash
    git clone https://github.com/FelipeFerraz4/blockchain-node
    ```
2. Acesse o diretório do projeto e instale as dependências:
    ```bash
    cd blockchain-node
    npm install
    ```
## Executando o Projeto

Para executar o projeto, basta rodar o seguinte comando:
```bash
    node blockchain.js
```

## Estrutura de Código

- **Transactions:** Representa uma transação entre dois endereços (remetente e destinatário), com um valor associado.
- **Block:** Cada bloco contém um timestamp, hash do bloco anterior, um conjunto de transações e um nonce, que é ajustado até que o hash do bloco atenda à dificuldade da rede.
- **Blockchain:** Gerencia a cadeia de blocos, incluindo a criação do bloco gênesis, validação da cadeia, e mineração de novos blocos com transações pendentes.

## Exemplo de Uso

Aqui está um exemplo de como criar transações, minerar blocos e consultar o saldo de um endereço:

```javascript
const blockchain = new Blockchain('address1');

blockchain.createTransaction(new Transactions('address1', 'address2', 10));
blockchain.createTransaction(new Transactions('address1', 'address3', 20));

blockchain.minePendingTransactions('address1');
console.log(`Is Blockchain valid ? ${bitcoin.isBlockchainValid()}`)
```

## Licença

Este projeto está licenciado sob a licença MIT.