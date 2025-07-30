# 📊 Financial API – Controle Financeiro
Api desenvolvida em **NestJs** para gerenciar transações financeiras do usuário, incluindo cadastro, autenticação, controle de despesas e receitas, filtro mensal, categoria e tipo.
- Projeto criado com foco em aprendizado prático de backend, seguindo boas práticas de arquitetura, testes unitários e validação de dados.

## ✨ Funcionalidades
- **Cadastro e login do usuário (JWT)**
- **Criação, listagem, atualização e remoção de transações feitas pelo usuário**
- **Filtros por mês, tipo (expense / income) e categoria**
- **Cálculo automático de resumo financeiro (saldo, total de entradas e saídas)**
- **Validação completa dos dados via DTOs**
- **Cobertura extensiva de testes unitários**

## 🛠 Tecnologias & Conceitos
- **NestJS + TypeScript**
- **PostgreSql + TypeORM**
- **JWT (Autenticação)**
- **Validação com class-validator**
- **Separação de camadas: Controller, Service, DTOs, Entity, Utils**
- **Uso de Guards para rotas privadas**
- **Testes unitários com Jest**
- **Injeção de dependência & mocks para os testes**

## 🌱 Diferenciais técnicos
- **Testes unitários das príncipais funcionalidades de services e controllers, inclusive DTOs e utils**
- **Filtros com Between e paginação**
- **Arquitetura limpa (separação de responsábilidades)**
- **Uso de helpers e utils para lógica isolada e testável**

## 📁 Estrutura (resumo)
``` bash
src/
├── auth/                # Autenticação
├── user/                # Usuário
├── transaction/         # Transações financeiras
├── common/              # Enums, filtros, dtos comuns
├── utils/               # Funções auxiliares (ex.: calcular saldo)
```

## ⚙ Como rodar localmente
``` bash
  # clone o repositório
  git clone https://github.com/Gabriel-Labritz/financial-control-backend.git

  # acessa a pasta
  cd finantial-control-app

  # instale as dependências
  npm install

  # Rode o projeto
  npm run start:dev
```
## 📄 .env.example
**Crie um arquivo chamado .env na raiz do projeto seguindo esse exemplo**
```bash
  #DATABASE CONFIG
  DATABASE_TYPE=your database type
  DATABASE_HOST=your host
  DATABASE_PORT=port
  DATABASE_USERNAME=your database username
  DATABASE_DB=your database
  DATABASE_PASSWORD=password database
  DATABASE_AUTO_LOAD_ENTITIES=true
  DATABASE_SYNCHRONIZE=true

  #APP
  APP_PORT=your app port

  #JWT CONFIG
  JWT_SECRET=your secret here!
  JWT_AUDIENCE=localhost
  JWT_ISSUER=localhost
  JWT_TTL=time to jwt token expire (3600s)
```
## 🧪 Testes
- **Cobertura 100%** nos serviços, controllers, DTOs, filtros e funções utilitárias
- Testes de:
  - Fluxos de sucesso
  - Tratamento de erros (ex.: usuário não encontrado, senha incorreta)
  - Validações de dados (ex: campos obrigatórios, enums, tamanhos)
- Mocks de serviços, helpers e repositórios

⚙ Para rodar os testes
```bash
  npm run test:watch
```

