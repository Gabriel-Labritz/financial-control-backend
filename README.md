# 📊 Financial API – Controle Financeiro
Api desenvolvida em **NestJs** para gerenciar transações financeiras do usuário, incluindo cadastro, autenticação, controle de despesas e receitas, filtro mensal, categoria e tipo.
- Projeto criado com foco em aprendizado prático de backend, seguindo boas práticas de arquitetura, testes unitários e validação de dados.

# ✨ Funcionalidades
- **Cadastro e login do usuário (JWT)**
- **Criação, listagem, atualização e remoção de transações feitas pelo usuário**
- **Filtros por mês, tipo (expense / income) e categoria**
- **Cálculo automático de resumo financeiro (saldo, total de entradas e saídas)**
- **Validação completa dos dados via DTOs**
- **Cobertura extensiva de testes unitários**

# 🛠 Tecnologias & Conceitos
- **NestJS + TypeScript**
- **PostgreSql + TypeORM**
- **JWT (Autenticação)**
- **Validação com class-validator**
- **Separação de camadas: Controller, Service, DTOs, Entity, Utils**
- **Uso de Guards para rotas privadas**
- **Testes unitários com Jest**
- **Injeção de dependência & mocks para os testes**

# 📁 Estrutura (resumo)
``
src/
├── auth/                # Cadastro e login
├── user/                # Usuários
├── transaction/         # Transações financeiras
├── common/              # Enums, filtros, dtos comuns
├── utils/               # Funções auxiliares (ex.: calcular saldo)
└── tests/               # Testes unitários organizados por módulo

``

