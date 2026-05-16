# Segurança

## Modelo

Autenticação **completamente delegada ao `shell-app`**. O `user-mf` não autentica usuários nem acessa o Keycloak diretamente.

Fluxo: Usuário → Keycloak (via shell) → shell injeta Bearer token → user-mf envia requisições autenticadas ao gateway

## Autenticação

| Responsabilidade | Onde é feita |
|-----------------|--------------|
| Login / logout | `shell-app` via Keycloak |
| Emissão e renovação do JWT | Keycloak :9999 |
| Injeção do Bearer token | `includeBearerTokenInterceptor` do shell |
| Proteção da rota `/users` | `roleGuard('USER')` no shell |

O `user-mf` **não deve**:
- Instalar ou importar `keycloak-angular` / `keycloak-js`
- Configurar `INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG`
- Adicionar interceptors HTTP de autenticação
- Verificar ou decodificar o JWT localmente

## Role de Acesso

| Role | Rota protegida | Quem protege |
|------|---------------|--------------|
| `USER` | `/users` | `roleGuard` no `shell-app` |

Usuários sem a role `USER` são redirecionados para `/forbidden` pelo shell antes mesmo de o remote ser carregado.

## Bearer Token

O token é injetado automaticamente pelo shell em todas as requisições cujo URL começa com `environment.gatewayUrl` (`http://localhost:8081`).

O `user-mf` apenas configura o `HttpClient` sem interceptors:

```typescript
provideHttpClient()
```

## Erros de Acesso

| Cenário | Comportamento |
|---------|---------------|
| Não autenticado | Shell redireciona para login no Keycloak |
| Autenticado sem role `USER` | Shell redireciona para `/forbidden` |
| Token expirado durante uso | Keycloak renova automaticamente (responsabilidade do shell) |
| API retorna 401 | Componente exibe toast de erro |
| API retorna 403 | Componente exibe toast de erro |
| API retorna 404 | Componente exibe toast de erro |

## Boas Práticas

- Nunca logar dados sensíveis do usuário no console
- Nunca expor o token JWT em templates ou variáveis públicas
- Não armazenar tokens em `localStorage` ou `sessionStorage` neste remote
- Validar inputs do formulário antes de enviar ao backend (`Validators.required`, `Validators.email`)
- Não confiar em dados retornados do servidor sem type safety (usar interfaces TypeScript)
