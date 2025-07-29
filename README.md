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


