# Instruções do Copilot — User App

## Idioma (OBRIGATÓRIO)

- Todas as respostas DEVEM ser em português (pt-BR)
- Termos técnicos podem permanecer em inglês

---

## Projeto

Aplicação Angular 19 que atua como **remote** de uma arquitetura Micro Frontend (MFE), carregado dinamicamente pelo `shell-app` na rota `/users`. Responsável pelo CRUD de usuários.

| Item | Detalhe |
|------|---------|
| Linguagem | TypeScript 5.7 |
| Framework | Angular 19 (standalone components) |
| Federation | `@angular-architects/native-federation` (remote) |
| UI | PrimeNG 19 com tema Aura |
| Autenticação | Delegada ao `shell-app` — sem Keycloak direto |
| Testes | `ng test` — Karma + Jasmine (Edge headless) |
| Build | `ng build` |
| API | `gateway-api` em `:8090` → `user-api` em `:8081` |

---

## Documentação de referência

Consulte sempre antes de implementar:

- [Arquitetura](docs/architecture.md) — camadas, diagrama, fluxo de auth delegada
- [Convenções](docs/conventions.md) — standalone, signals, inject(), nomenclatura de artefatos
- [Segurança](docs/security.md) — auth delegada, roles, erros HTTP, boas práticas
- [Federation](docs/federation.md) — config do remote, registro no shell, singleton sharing
- [Testes](docs/testing.md) — Karma + Jasmine, estrutura, nomenclatura, antipadrões

---

## Checklist para cada implementação

Para **toda** nova funcionalidade ou alteração, o Copilot DEVE:

1. **Manter standalone** — não criar ou modificar NgModules → [Convenções](docs/conventions.md)
2. **Não adicionar autenticação** — sem Keycloak, sem interceptors de Bearer token; auth é responsabilidade do shell → [Segurança](docs/security.md)
3. **Usar `environment.gatewayUrl`** como base de todas as URLs de API — nunca hardcodar endereços → [Arquitetura](docs/architecture.md)
4. **Criar testes unitários** com Karma + Jasmine para serviços e componentes → [Testes](docs/testing.md)
   - Padrão de nome: `should<ComportamentoEsperado>`
5. **Garantir que todos os testes passam** — regressões não são permitidas
6. **Manter versões de dependências sincronizadas** com o `shell-app` para garantir singleton sharing via Native Federation → [Federation](docs/federation.md)
7. **Atualizar `docs/plans/README.md`** se um plano de execução foi concluído

---
