# Plano: Tela Perfil — Dados, Senha e Família

Status: done

Autor: Daniel

Data: 2026-05-16

## TL;DR

Implementar o conteúdo da página **"Meu Perfil"** como nova rota `profile` (lazy) no `user-mf`. Três cards independentes: dados pessoais (edição inline), alterar senha e família (abas + gerenciamento de convites). API: `/api/v1/profile/*` e `/api/v1/profile/family/*` via `environment.gatewayUrl`.

---

## Phase 1 — Models

**Arquivo:** `src/app/core/models/profile.model.ts` (novo)

Interfaces e tipos mapeados da spec OpenAPI:

- `ProfileResponse` — cpf, email, nomeCompleto, telefone
- `ProfileUpdateRequest` — nomeCompleto, cpf, email, telefone
- `PasswordChangeRequest` — senhaAtual, novaSenha, confirmarNovaSenha (todos required)
- `CreateFamilyRequest` — nome (required)
- `FamilyResponse` — id, nome, titular (FamilyMemberResponse), membros (FamilyMemberResponse[])
- `FamilyMemberResponse` — id, nomeCompleto, email, parentesco, status
- `FamilyUpdateMemberRequest` — parentesco, status
- `FamilyInvitationSendRequest` — receiverEmail (required), parentesco (required)
- `FamilyInvitationResponse` — id, requesterNome, receiverEmail, parentesco, status, createdAt
- `ParentescoEnum`: TITULAR | CONJUGE | FILHO | FILHA | PAI | MAE | IRMAO | IRMA | OUTRO
- `FamilyMemberStatusEnum`: ATIVO | INATIVO
- `InvitationStatusEnum`: AGUARDANDO_TITULAR | PENDENTE | ACEITO | RECUSADO

---

## Phase 2 — ProfileService

**Arquivos:**
- `src/app/core/services/profile.service.ts` (novo)
- `src/app/core/services/profile.service.spec.ts` (novo)

Padrão de `user.service.ts`: `inject(HttpClient)`, `environment.gatewayUrl`, `providedIn: 'root'`.

Métodos:

| Método | HTTP | Endpoint |
|--------|------|----------|
| `getProfile()` | GET | /api/v1/profile |
| `updateProfile(req)` | PUT | /api/v1/profile |
| `changePassword(req)` | PUT | /api/v1/profile/password → 204 |
| `createFamily(req)` | POST | /api/v1/profile/family → 201 |
| `getFamily()` | GET | /api/v1/profile/family |
| `updateFamilyMember(id, req)` | PUT | /api/v1/profile/family/members/{id} |
| `removeFamilyMember(id)` | DELETE | /api/v1/profile/family/members/{id} → 204 |
| `requestInvitation(req)` | POST | /api/v1/profile/family/invitations |
| `listReceivedInvitations()` | GET | /api/v1/profile/family/invitations/received |
| `listSentInvitations()` | GET | /api/v1/profile/family/invitations/sent |
| `approveInvitation(id)` | PUT | /api/v1/profile/family/invitations/{id}/approve |
| `rejectInvitationByTitular(id)` | PUT | /api/v1/profile/family/invitations/{id}/reject-titular |
| `acceptInvitation(id)` | PUT | /api/v1/profile/family/invitations/{id}/accept |
| `rejectInvitation(id)` | PUT | /api/v1/profile/family/invitations/{id}/reject |

Spec: padrão de `user.service.spec.ts` com `HttpTestingController`, um `it` por método.

---

## Phase 3 — ProfileComponent (container)

**Arquivos:**
- `src/app/pages/profile/profile.component.ts`
- `src/app/pages/profile/profile.component.html`
- `src/app/pages/profile/profile.component.spec.ts`

Responsabilidades:
- `profile = signal<ProfileResponse | null>(null)` carregado no `ngOnInit` via `ProfileService.getProfile()`
- Cabeçalho: ícone `pi-user`, título "Meu Perfil", breadcrumb "Início > Perfil"
- Grid layout: linha 1 = [PersonalDataCard (col-6) | ChangePasswordCard (col-6)]; linha 2 = [FamilyCard (col-12)]
- Passa `profile()` como `@Input` para `PersonalDataCardComponent`
- Recebe evento `(profileUpdated)` e atualiza o signal `profile`

---

## Phase 4 — PersonalDataCardComponent

**Arquivos:** `src/app/pages/profile/components/personal-data-card/` (3 arquivos)

- `@Input({ required: true }) profile: ProfileResponse`
- `@Output() profileUpdated = new EventEmitter<ProfileResponse>()`
- `editMode = signal(false)`

**Modo visualização:**
- 4 linhas com ícone colorido (fundo arredondado), rótulo e valor:
  - Nome Completo: `pi-user` (fundo azul/índigo)
  - CPF: `pi-id-card` (fundo verde)
  - E-mail: `pi-envelope` (fundo azul-claro)
  - Telefone: `pi-phone` (fundo amarelo)
- Botão "Editar" (`p-button` outlined, `icon="pi pi-pencil"`) no canto superior direito → `editMode.set(true)`

**Modo edição:**
- Mesmos 4 campos como `p-inputtext` (nomeCompleto, cpf, email, telefone)
- Botão "Salvar" → `ProfileService.updateProfile()` → sucesso: emite `profileUpdated` + `editMode.set(false)` + toast sucesso | erro: toast com mensagem da API
- Botão "Cancelar" → restaura valores originais do `@Input` + `editMode.set(false)`

---

## Phase 5 — ChangePasswordCardComponent

**Arquivos:** `src/app/pages/profile/components/change-password-card/` (3 arquivos)

- `ReactiveFormsModule`, `FormGroup` com campos: `senhaAtual`, `novaSenha`, `confirmarNovaSenha`
- Validator cross-field no `FormGroup`: `novaSenha === confirmarNovaSenha` (erro `passwordMismatch`)
- 3 campos `p-password` com `[toggleMask]="true"` e `[feedback]="false"`
- Botão "Atualizar senha" com `icon="pi pi-lock"` — desabilitado enquanto form inválido
- Submit → `changePassword()`:
  - 204 → toast sucesso + `form.reset()`
  - 400 → toast com `error.error.message`
  - 502 → toast "Falha ao comunicar com o servidor"

---

## Phase 6 — FamilyCardComponent

**Arquivos:** `src/app/pages/profile/components/family-card/` (3 arquivos)

### ngOnInit
- `getFamily()`:
  - 200 → `family = signal<FamilyResponse>(data)`, `hasFamily = signal(true)`
  - 404 → `hasFamily = signal(false)`

### Estado sem família (404)
- Card com ícone, texto explicativo ("Você ainda não pertence a uma família")
- Botão "Criar família" → `p-dialog` com campo `nome`:
  - `createFamily({ nome })` → 201 → `hasFamily.set(true)` + recarrega `getFamily()` + fecha dialog

### Estado com família (200)
- Botão "+ Adicionar familiar" (`p-button icon="pi pi-plus"`) → `addDialogVisible = signal(true)`
- `p-tabs` com 3 abas (rótulos incluem contagem reativa):

**Aba "Familiares (N)"**
- Array combinado: `[family().titular, ...family().membros]`
- `p-table` colunas: NOME, EMAIL, PARENTESCO, STATUS, AÇÕES
  - NOME: avatar circular com iniciais + nome completo; titular tem `p-tag` "Você"
  - STATUS: `p-tag` severity `success` (ATIVO) ou `secondary` (INATIVO)
  - AÇÕES: `—` para titular; `p-button` ⋮ com `p-menu` → "Editar" (abre dialog `FamilyUpdateMemberRequest`) e "Remover" (confirm → `removeFamilyMember(id)`) para não-titulares

**Aba "Convites pendentes recebidos (N)"**
- `listReceivedInvitations()` → `p-table` colunas: SOLICITANTE, EMAIL, PARENTESCO, STATUS, AÇÕES
- Ações: botão "Aceitar" → `acceptInvitation(id)` | botão "Recusar" → `rejectInvitation(id)`
- Após ação: recarrega `listReceivedInvitations()` + `getFamily()`

**Aba "Convites enviados (N)"**
- `listSentInvitations()` → `p-table` colunas: DESTINATÁRIO, PARENTESCO, STATUS, CRIADO EM
- CRIADO EM: pipe `date: 'dd/MM/yyyy HH:mm'`

### Dialog "Adicionar familiar"
- `p-dialog` com `ReactiveFormsModule`:
  - `receiverEmail`: `InputText` + validação `email` e `required`
  - `parentesco`: `p-select` com opções de `ParentescoEnum` excluindo `TITULAR`
- Botão "Enviar convite" → `requestInvitation()` → recarrega `listSentInvitations()` → fecha dialog

---

## Phase 7 — Rota

**Arquivo:** `src/app/app.routes.ts`

Adicionar após a rota existente:

```typescript
{
  path: 'profile',
  loadComponent: () =>
    import('./pages/profile/profile.component').then(m => m.ProfileComponent),
}
```

---

## Phase 8 — Documentação

- Atualizar `docs/plans/2026-05-16-inicial-perfil.md` adicionando entrada com status `done`
- Atualizar `docs/plans/README.md` adicionando entrada com status `done`

---

## Relevant files

| Arquivo | Tipo |
|---------|------|
| `src/app/core/models/profile.model.ts` | novo |
| `src/app/core/services/profile.service.ts` | novo |
| `src/app/core/services/profile.service.spec.ts` | novo |
| `src/app/pages/profile/profile.component.ts` | novo |
| `src/app/pages/profile/profile.component.html` | novo |
| `src/app/pages/profile/profile.component.spec.ts` | novo |
| `src/app/pages/profile/components/personal-data-card/personal-data-card.component.ts` | novo |
| `src/app/pages/profile/components/personal-data-card/personal-data-card.component.html` | novo |
| `src/app/pages/profile/components/personal-data-card/personal-data-card.component.spec.ts` | novo |
| `src/app/pages/profile/components/change-password-card/change-password-card.component.ts` | novo |
| `src/app/pages/profile/components/change-password-card/change-password-card.component.html` | novo |
| `src/app/pages/profile/components/change-password-card/change-password-card.component.spec.ts` | novo |
| `src/app/pages/profile/components/family-card/family-card.component.ts` | novo |
| `src/app/pages/profile/components/family-card/family-card.component.html` | novo |
| `src/app/pages/profile/components/family-card/family-card.component.spec.ts` | novo |
| `src/app/app.routes.ts` | alterar — adicionar rota `profile` |
| `docs/plans/2026-05-16-inicial-perfil.md` | novo |
| `docs/plans/README.md` | alterar — adicionar entrada |

---

## Verification

1. `ng test` sem regressões em todos os specs
2. Rota `/profile` carrega corretamente no shell com cabeçalho e breadcrumb
3. Edição inline dos dados pessoais salva e reflete os valores sem reload
4. Validator bloqueia submit quando `novaSenha ≠ confirmarNovaSenha`; toast de sucesso após 204
5. `GET /api/v1/profile/family` → 404 exibe estado vazio + botão "Criar família"; após criar, card completo aparece
6. Aba "Familiares" exibe badge "Você" no titular; ação "Remover" com confirmação remove membro corretamente
7. Dialog "Adicionar familiar" envia convite e recarrega as 3 abas
8. Convites recebidos: aceitar/recusar atualizam a lista em tempo real

---

## Decisions

- CPF **não aparece** na tabela de familiares — `FamilyMemberResponse` não tem o campo (correto pela spec)
- Fluxo "Criar família" está incluído — necessário quando usuário ainda não tem família (GET retorna 404)
- Edição dos dados pessoais: inline no card (sem dialog)
- Adicionar familiar: via `p-dialog`
- Rota: `loadComponent` lazy em `app.routes.ts`; shell já carrega o remote
