# Testes

## Estratégia

- **Unitários (obrigatório)** — serviços com `HttpTestingController`; componentes com `TestBed`
- Framework: **Karma + Jasmine**
- Browser: **Microsoft Edge (headless)** — configurado via `CHROME_BIN` em `karma.conf.js`

## Escopo Obrigatório

Todo serviço DEVE ter testes cobrindo:
- Todos os métodos CRUD
- Respostas de sucesso (200, 201, 204)
- Respostas de erro (401, 404)

Todo componente crítico DEVE ter testes cobrindo:
- Renderização correta
- Interações do usuário (abrir dialog, submit, cancelar)
- Integração com o service (via mock)

## Estrutura

```
src/app/
  app.component.spec.ts
  core/services/
    user.service.spec.ts
  pages/
    user-list/
      user-list.component.spec.ts
    user-form/
      user-form.component.spec.ts
```

## Nomenclatura

Padrão: `should<ComportamentoEsperado>`

Exemplos:
- `shouldReturnListOfUsers`
- `shouldHandle401ErrorOnListUsers`
- `shouldOpenFormInCreateModeWhenNovoIsClicked`
- `shouldEmitSavedEventOnSuccessfulCreate`
- `shouldNotSubmitWhenFormIsInvalid`

## Regras

- Mockar todas as dependências externas (`UserService`, `MessageService`, `ConfirmationService`)
- Usar `HttpTestingController` para testar o service — sem HTTP real
- Chamar `httpMock.verify()` no `afterEach` para garantir que não há requisições pendentes
- Cada teste valida um único comportamento
- Cada teste é independente (sem estado compartilhado entre `it`)
- Usar `NoopAnimationsModule` para desabilitar animações do PrimeNG nos testes

## Executar Testes

```bash
ng test
```

```bash
ng test --watch=false
```

## Antipadrões

- Testar múltiplos comportamentos em um único `it`
- Fazer requisições HTTP reais nos testes
- Testes sem asserções (`expect`)
- Ignorar cenários de erro da API
- Usar `tick()` / `fakeAsync` desnecessariamente quando `of()` resolve de forma síncrona
