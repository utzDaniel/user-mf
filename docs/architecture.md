# Arquitetura

## Estilo

Aplicação Angular 19 que atua como **remote** de uma arquitetura Micro Frontend (MFE). Expõe o `AppComponent` via Native Federation e é carregado dinamicamente pelo `shell-app` na rota `/users`.

## Camadas

```
shell-app :4200  (host)
  └── /users  →  loadRemoteModule('user-mf', './Component')
                      └── AppComponent         (entry point exposto)
                            └── UserListComponent
                                  ├── p-table  (listagem de usuários)
                                  └── UserFormComponent  (p-dialog criação/edição)
```

## Módulos / Camadas do Remote

| Camada | Localização | Responsabilidade |
|--------|-------------|------------------|
| Entry Point | `src/app/app.component.ts` | Componente raiz exposto via federation |
| Config | `src/app/app.config.ts` | Providers: router, HTTP, PrimeNG |
| Routes | `src/app/app.routes.ts` | `{ path: '', component: UserListComponent }` |
| Models | `src/app/core/models/` | Interfaces `User`, `UserCreateRequest`, `UserUpdateRequest` |
| Services | `src/app/core/services/` | `UserService` — CRUD via `HttpClient` |
| Pages | `src/app/pages/` | `UserListComponent`, `UserFormComponent` |

## Dependências Externas

| Serviço | Função | Porta |
|---------|--------|-------|
| shell-app | Host MFE — carrega este remote, injeta Bearer token | 4200 |
| gateway-api | Backend BFF — recebe requisições HTTP com Bearer token | 8090 |
| user-api | Serviço de negócio de usuários | 8081 |

## Diagrama

```
 shell-app :4200
  +-- autentica   --> Keycloak :9999  (responsabilidade do shell)
  +-- Bearer token automático via includeBearerTokenInterceptor
  +-- carrega     --> remoteEntry.json de user-mf :4201
       |
       v
  user-mf :4201
  +-- requisições --> gateway-api :8090
                           |
                           v
                      user-api :8081
```

## Fluxo de Autenticação

1. Autenticação gerenciada pelo `shell-app` via Keycloak
2. O `includeBearerTokenInterceptor` do shell injeta o Bearer token em todas as requisições ao `gatewayUrl`
3. O `user-mf` **não** configura Keycloak nem interceptors de autenticação — token chega em runtime via shell
4. Rota `/users` protegida no shell pelo `roleGuard('USER')` — usuários sem a role são redirecionados para `/forbidden`

## Restrições de Design

- O remote **nunca** deve ser executado standalone com autenticação própria em produção
- Não importar `keycloak-angular` ou `keycloak-js`
- Não configurar `INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG` — responsabilidade do shell
- Gestão de roles por usuário (`/api/v1/users/{id}/roles`) está fora do escopo atual
