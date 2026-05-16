# Plano: Initial Setup

Status: done

Autor: Daniel

Data: 2026-05-02

## TL;DR

Criar o `user-mf` como Angular 19 Remote MFE (Native Federation), expondo `AppComponent` via `./Component`. Consome a `user-api` pelo `gateway-api` (:8090). CRUD completo de usuários com PrimeNG 19. Sem Keycloak direto — Bearer token gerenciado pelo shell.

---

## Fase 1 — Scaffold do Projeto

1. Criar projeto Angular 19: `ng new user-mf --standalone --routing --style=scss`
2. Instalar dependências (espelhar versões do shell-app para singleton sharing):
   - `@angular-architects/native-federation ^19.0.23`
   - `@softarc/native-federation-node ^3.3.4`
   - `primeng ^19.1.4`, `@primeng/themes ^19.1.4`, `primeicons ^7.0.0`, `@angular/cdk ^19.2.19`
   - `es-module-shims ^1.5.12`
   - **Não** instalar `keycloak-angular` / `keycloak-js` (auth delegado ao shell)
3. Configurar `tsconfig.json`, `tsconfig.app.json`, `tsconfig.federation.json`
4. Configurar `angular.json`: porta **4201**, builder `@angular-architects/native-federation:build`

## Fase 2 — Native Federation (Remote)

5. Criar `federation.config.js` como **remote**:
   - `name: 'user-mf'`
   - `exposes: { './Component': './src/app/app.component.ts' }`
   - `shared: shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' })` espelhando o `skip` do `shell-app/federation.config.js`
6. Ajustar `src/main.ts` e `src/bootstrap.ts` para inicialização via Native Federation

## Fase 3 — Environments e Config HTTP

7. Criar `src/environments/environment.ts` e `environment.production.ts`:
   - `gatewayUrl: 'http://localhost:8090'`
8. Criar `src/app/app.config.ts`:
   - `provideZoneChangeDetection`, `provideRouter(routes)`, `provideAnimationsAsync()`
   - `provideHttpClient()` — sem interceptor; Bearer token injetado pelo interceptor do shell em runtime
   - `providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.dark-mode' } } })`
   - **Sem Keycloak** — o remote não autentica diretamente

## Fase 4 — Models e Service

9. Criar `src/app/core/models/user.model.ts`:
   - `User`: `{ id: number; name: string; email: string; createdAt: string; updatedAt: string }`
   - `UserCreateRequest`: `{ name: string; email: string }`
   - `UserUpdateRequest`: `{ name?: string; email?: string }`
10. Criar `src/app/core/services/user.service.ts` (`providedIn: 'root'`):
    - `inject(HttpClient)`, URL base = `environment.gatewayUrl`
    - `listUsers(): Observable<User[]>` → GET `/api/v1/users`
    - `getUserById(id: number): Observable<User>` → GET `/api/v1/users/{id}`
    - `createUser(req: UserCreateRequest): Observable<User>` → POST `/api/v1/users`
    - `updateUser(id: number, req: UserUpdateRequest): Observable<User>` → PUT `/api/v1/users/{id}`
    - `deleteUser(id: number): Observable<void>` → DELETE `/api/v1/users/{id}`
    - `getUserRoles` / `updateUserRoles` → reservados para fase futura

## Fase 5 — Componentes de UI

11. Criar `src/app/pages/user-list/user-list.component.ts` + `.html`:
    - `p-table` com colunas: id, nome, e-mail, createdAt
    - Signal `users = signal<User[]>([])` carregado no `ngOnInit`
    - Botão "Novo" → abre `UserFormComponent` em modo criação
    - Ações por linha: Editar → abre dialog com dados preenchidos; Excluir → `p-confirmdialog`
    - `p-toast` para feedback de sucesso/erro
12. Criar `src/app/pages/user-form/user-form.component.ts` + `.html`:
    - `p-dialog` com formulário (campos: nome, e-mail)
    - `@Input() userId?: number` — `undefined` = criação; preenchido = edição
    - Signal `visible = signal(false)` para controle do dialog
    - `@Output() saved = new EventEmitter<void>()` para refrescar a lista
    - `ReactiveFormsModule` com validações (`required`, `email`)
13. Criar `src/app/app.component.ts`:
    - Entry point exposto via federation — renderiza `UserListComponent`
    - Selector: `app-root`
14. Criar `src/app/app.routes.ts`:
    - `{ path: '', component: UserListComponent }`

## Fase 6 — Testes Unitários

15. `user.service.spec.ts`: usar `HttpTestingController`; cobrir todos os métodos CRUD; cenários 200/201/204 e erros 401/404
16. `user-list.component.spec.ts`: mockar `UserService`; verificar renderização da tabela e disparo do dialog
17. `app.component.spec.ts`: smoke test de criação do componente raiz

## Arquivos a criar

- `user-mf/package.json`
- `user-mf/angular.json`
- `user-mf/tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json`, `tsconfig.federation.json`
- `user-mf/federation.config.js`
- `user-mf/karma.conf.js`
- `user-mf/src/main.ts`, `bootstrap.ts`, `index.html`, `styles.scss`
- `user-mf/src/app/app.component.ts` + `.spec.ts`
- `user-mf/src/app/app.config.ts`
- `user-mf/src/app/app.routes.ts`
- `user-mf/src/app/core/models/user.model.ts`
- `user-mf/src/app/core/services/user.service.ts` + `.spec.ts`
- `user-mf/src/app/pages/user-list/user-list.component.ts` + `.html` + `.spec.ts`
- `user-mf/src/app/pages/user-form/user-form.component.ts` + `.html` + `.spec.ts`
- `user-mf/src/environments/environment.ts` + `environment.production.ts`
- `user-mf/docs/plans/2026-05-02-initial-setup.md`

## Verificação

1. `ng build` sem erros de compilação
2. `ng test` — todos os testes passando (sem regressões)
3. Shell em `:4200` + `user-mf` em `:4201` → rota `/users` carrega o remote via `loadRemoteModule`
4. CRUD funcional chamando `gateway-api :8090` → `user-api :8081`

## Decisions / Assumptions

- Standalone components — sem NgModules
- `inject()` para DI; Signals para estado local
- Bearer token delegado ao shell — remote **sempre** rodado dentro do shell; sem suporte standalone com auth
- CRUD via dialogs PrimeNG — sem sub-rotas internas para evitar conflito com roteamento do shell
- Versões idênticas ao `shell-app` para garantir singleton sharing via Native Federation
- Gestão de roles (`/api/v1/users/{id}/roles`) fora do escopo — fase futura