# Blockchain
Projeto de simulação de blockchain utilizando Node.js. O objetivo é criar uma blockchain simples, incluindo o mecanismo de proof-of-work, transações e verificação de integridade da cadeia de blocos.

## Tecnologias Utilizadas
- **Node.js:** Plataforma de execução do JavaScript.
- **Crypto:** Módulo nativo para criar hashes SHA-256.
- **Lodash:** Biblioteca JavaScript que fornece utilitários para facilitar operações comuns de manipulação de dados, como clonagem, iteração e manipulação de objetos e arrays.

## Funcionalidades
Este projeto permite:
- Criar uma blockchain com bloco gênesis.
- Adicionar transações à pool de transações pendentes.
- Minerar blocos utilizando proof-of-work com ajuste de dificuldade.
- Validar a integridade da blockchain.
- Consultar o saldo de endereços específicos.
- Assinatura digital das transações com chave privada.
- Verificação de transações usando a chave pública.
- Criação e conexão de múltiplos nós.
- Sincronização de blocos entre nós conectados.
- Distribuição de transações entre nós.
- Estado Global e Controle de Saldos
- Taxas de Transação e Recompensas

## Relatório de entrega das Sprints
- [1º Sprint: 07/10/2024 - 11/10/2024]()
- [2º Sprint: 04/11/2024 - 08/11/2024]()
- [3º Sprint: 09/12/2024 - 13/12/2024]()

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
    node app.js
```

## Estrutura de Código

- **Classe Transactions:** 
    - Representa uma transação entre dois endereços (remetente e destinatário), com um valor associado. 
    - A transação é assinada digitalmente com a chave privada do remetente para garantir a integridade e autenticidade.
- **Classe Block:** 
    - Cada bloco contém um timestamp, hash do bloco anterior, um conjunto de transações, uma imagem dos saldos atuais e um nonce, que é ajustado até que o hash do bloco atenda à dificuldade da rede. 
    - O nonce é alterado durante o processo de mineração como parte do proof-of-work.
- **Classe Blockchain:**
    - A classe Blockchain gerencia a cadeia de blocos, incluindo:
        - A criação do bloco gênesis (o primeiro bloco da blockchain).
        - A validação da cadeia para garantir que todos os blocos estejam conectados corretamente e que não houve adulteração.
        - A mineração de novos blocos com transações pendentes, utilizando o algoritmo de proof-of-work para garantir que a mineração seja computacionalmente difícil.
- **Classe KeyPair:**
    - A classe KeyPair gera um par de chaves criptográficas (pública e privada) usando o algoritmo secp256k1. 
    - A chave pública é convertida em um endereço único usando uma combinação de hashes SHA-256 e RIPEMD-160. 
    - A classe também permite assinar e verificar transações usando a chave privada para autenticação, garantindo a integridade das transações entre dois endereços.
- **Classe Node:**
    - A classe Node simula um nó na rede blockchain, com a capacidade de:
        - ``Criar transações:`` Cada transação é assinada com a chave privada do remetente e adicionada à pool de transações pendentes do nó.
        - ``Conectar-se a outros nós:`` Cada nó pode se conectar a outros nós na rede para compartilhar informações de transações e blocos minerados.
        - ``Mineração:`` O nó pode minerar blocos, pegando transações pendentes e criando um novo bloco para adicionar à blockchain, utilizando o algoritmo de proof-of-work.
        - ``Sincronização:`` Ao se conectar a outros nós, o nó pode sincronizar sua blockchain com a mais longa e válida.
- **Arquivo teste app.js:**
    - O arquivo app.js é o ponto de entrada da aplicação. Ele orquestra a criação dos blocos, transações e a interação entre os nós. Algumas das funcionalidades incluem:
        - ``Inicialização do blockchain:`` O arquivo cria a primeira instância da blockchain e do nó.
        - ``Criação e execução de transações:`` As transações são geradas entre os endereços, assinadas e passadas para os nós para mineração.
        - ``Exibição do estado dos nós:`` Após a mineração, o estado de cada nó é impresso para visualização da cadeia de blocos e transações.
## Licença

Este projeto está licenciado sob a licença MIT.