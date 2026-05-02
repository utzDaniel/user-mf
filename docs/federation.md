# Micro Frontend Federation

## Modelo

Native Federation (`@angular-architects/native-federation`) — este app atua como **remote**. Expõe o `AppComponent` e é carregado pelo `shell-app` (host) via `remoteEntry.json`.

## Configuração do Remote

Definida em `federation.config.js`:

```js
module.exports = withNativeFederation({
  name: 'user-mf',

  exposes: {
    './Component': './src/app/app.component.ts',
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
  ],
});
```

## Registro no Shell

O `shell-app` registra este remote em `public/federation.manifest.json`:

```json
{
  "user-mf": "http://localhost:4201/remoteEntry.json"
}
```

## Carregamento no Shell

O remote é carregado via `loadRemoteModule` na rota `/users` do shell:

```typescript
{
  path: 'users',
  canActivate: [roleGuard('USER')],
  loadComponent: () =>
    loadRemoteModule('user-mf', './Component').then(m => m.AppComponent),
}
```

## Singleton Sharing

Todas as dependências são compartilhadas como singleton com `strictVersion: true`. As versões **devem ser idênticas** às do `shell-app` para evitar conflitos em runtime:

| Pacote | Versão |
|--------|--------|
| `@angular/*` | `^19.2.0` |
| `primeng` | `^19.1.4` |
| `@primeng/themes` | `^19.1.4` |
| `rxjs` | `~7.8.0` |
| `zone.js` | `~0.15.0` |

## Porta

| Ambiente | URL |
|----------|-----|
| Desenvolvimento | `http://localhost:4201` |
| remoteEntry | `http://localhost:4201/remoteEntry.json` |

## Regras

- O remote nunca importa código-fonte do shell diretamente
- O `AppComponent` é o único entry point exposto — não expor services, models ou guards
- Manter versões de dependências sincronizadas com o `shell-app` a cada atualização
- Em produção, a URL do remoteEntry deve ser atualizada via variável de ambiente ou CI/CD no manifest do shell
