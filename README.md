# user-mf

> Micro Frontend de gerenciamento de usuários — Remote da arquitetura MFE do Portal Corporativo.

---

## Visão Geral

`user-mf` é uma aplicação Angular 19 standalone que atua como **remote** na arquitetura Micro Frontend baseada em Native Federation. Ele é carregado dinamicamente pelo `shell-app` na rota `/users` e expõe o `AppComponent` via `./Component`.

Responsabilidades:
- CRUD completo de usuários (listar, criar, editar, excluir)
- Comunicação direta com a `user-api` em `:8081`
- Autenticação **delegada ao shell** — o Bearer token é injetado automaticamente pelo interceptor do `shell-app`

---

## Arquitetura

```
shell-app :4200  (host)
  └── /users  →  loadRemoteModule('user-mf', './Component')
                      └── user-mf :4201  (remote)
                            └── AppComponent
                                  └── UserListComponent
                                        └── UserFormComponent (p-dialog)
```

### Estrutura de Pastas

```
src/
  app/
    app.component.ts          # Entry point exposto via federation
    app.config.ts             # Providers: router, HTTP, PrimeNG
    app.routes.ts             # { path: '', component: UserListComponent }
    core/
      models/
        user.model.ts         # User, UserCreateRequest, UserUpdateRequest
      services/
        user.service.ts       # CRUD via HttpClient → user-api :8081
    pages/
      user-list/              # Tabela PrimeNG + ações editar/excluir
      user-form/              # Dialog PrimeNG para criar/editar
  environments/
    environment.ts            # gatewayUrl: 'http://localhost:8081'
    environment.production.ts
```

---

## Pré-requisitos

| Ferramenta | Versão |
|-----------|--------|
| Node.js | 20+ |
| Angular CLI | 19.x |
| shell-app | rodando em `:4200` |
| user-api | rodando em `:8081` |

---

## Instalação

```bash
npm install
```

---

## Desenvolvimento

```bash
ng serve --port 4201
```

O remote ficará disponível em `http://localhost:4201`. O `shell-app` carregará o `remoteEntry.json` a partir desta URL.

> **Atenção:** o `user-mf` não possui autenticação própria. Para navegar na rota `/users`, o usuário precisa estar autenticado no shell com a role `USER`.

---

## Build

```bash
ng build
```

Artefatos gerados em `dist/user-mf/`.

---

## Testes

```bash
ng test
```

Executa os testes unitários com Karma + Jasmine no Microsoft Edge (headless).

### Cobertura

| Arquivo | Cenários cobertos |
|---------|------------------|
| `user.service.spec.ts` | `listUsers`, `getUserById`, `createUser`, `updateUser`, `deleteUser` — respostas 200/201/204 e erros 401/404 |
| `user-list.component.spec.ts` | Renderização da tabela, abertura do form (criar/editar), refresh após salvar, fechamento ao cancelar |
| `user-form.component.spec.ts` | Modo criação/edição, carregamento de dados, submit válido, bloqueio de submit inválido, emit de cancelled |
| `app.component.spec.ts` | Smoke test de criação do componente raiz |

---

## Native Federation

Configurado em `federation.config.js` como **remote**:

```js
module.exports = withNativeFederation({
  name: 'user-mf',
  exposes: {
    './Component': './src/app/app.component.ts',
  },
  shared: shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
});
```

O shell registra este remote em `public/federation.manifest.json`:

```json
{
  "user-mf": "http://localhost:4201/remoteEntry.json"
}
```

---

## API

Base URL: `http://localhost:8081/api/v1/users`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/v1/users` | Listar todos os usuários |
| `GET` | `/api/v1/users/{id}` | Buscar usuário por ID |
| `POST` | `/api/v1/users` | Criar usuário |
| `PUT` | `/api/v1/users/{id}` | Atualizar usuário |
| `DELETE` | `/api/v1/users/{id}` | Excluir usuário |

O Bearer token é injetado automaticamente pelo `includeBearerTokenInterceptor` do `shell-app`. O `user-mf` **não** configura interceptors de autenticação próprios.

> **Nota:** as requisições vão direto para a `user-api` em `:8081` — sem gateway intermediário.

---

## Convenções

- **Standalone components** — sem NgModules
- `inject()` para injeção de dependências — sem construtor
- **Signals** para estado local (`signal`, `computed`)
- Selector prefixado com `app-` (ex.: `app-user-list`)
- Template em arquivo `.html` separado quando exceder ~20 linhas

---

## Integração com o Shell

O `shell-app` carrega este remote na rota `/users` com proteção de role:

```typescript
{
  path: 'users',
  canActivate: [roleGuard('USER')],
  loadComponent: () =>
    loadRemoteModule('user-mf', './Component').then(m => m.AppComponent),
}
```

Usuários sem a role `USER` são redirecionados para `/forbidden` pelo shell.

---

## Roadmap

- [ ] Gestão de roles por usuário (`GET/PUT /api/v1/users/{id}/roles`)
- [ ] Paginação e filtros na listagem
- [ ] Suporte a execução standalone (com autenticação própria)
