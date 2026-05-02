# Convenções

## Regras Gerais

- Usar **standalone components** — nunca NgModules
- Injeção de dependência via `inject()` — nunca por construtor
- Preferir Angular Signals (`signal`, `computed`, `effect`) a `BehaviorSubject`/`Observable` para estado local
- Selector de componente sempre prefixado com `app-` (ex.: `app-user-list`)
- Template inline para componentes simples; arquivo `.html` separado quando exceder ~20 linhas

---

## Nomenclatura

| Artefato | Padrão | Exemplo |
|----------|--------|---------|
| Component | `<Feature>Component` | `UserListComponent` |
| Service | `<Feature>Service` | `UserService` |
| Model / Interface | `<Feature>` | `User`, `UserCreateRequest` |
| Arquivo | `<feature>.component.ts` | `user-list.component.ts` |
| Spec | `<feature>.component.spec.ts` | `user-list.component.spec.ts` |

---

## Componentes

- Sempre `standalone: true`
- Importar apenas o necessário no array `imports`
- Não criar NgModules

---

## Serviços e Injeção

- Usar `inject()` no corpo da classe
- `providedIn: 'root'` para serviços singleton
- Nunca instanciar serviços manualmente fora do TestBed

---

## Signals e Reatividade

- Estado local: `signal()`
- Estado derivado: `computed()`
- Efeitos colaterais: `effect()`
- Não expor signals mutáveis diretamente — use `.asReadonly()` quando o signal for propriedade pública de um serviço

---

## Autenticação

- **Sem Keycloak direto** — não instalar `keycloak-angular` / `keycloak-js`
- O Bearer token é injetado em runtime pelo shell
- Nunca adicionar interceptors de autenticação neste remote

---

## HTTP e API

- URL base sempre via `environment.gatewayUrl`
- Métodos do service retornam `Observable<T>` — sem subscribe dentro do service
- Tratamento de erros feito nos componentes via `error` callback do `subscribe`

---

## UI com PrimeNG

- Versões de PrimeNG idênticas ao `shell-app` para garantir singleton sharing via Native Federation
- Usar componentes standalone do PrimeNG (importar diretamente, sem módulos legados)
- `MessageService` e `ConfirmationService` fornecidos no provider do componente que os usa, não no root
- Dialogs controlados por `signal<boolean>` — nunca por `@Input` two-way binding direto em `visible`

---

## Federation

- O componente exposto via federation é sempre o `AppComponent` (`./Component`)
- Versões de todas as dependências compartilhadas devem espelhar o `shell-app`
- Nunca exportar serviços ou models diretamente via federation — apenas componentes
