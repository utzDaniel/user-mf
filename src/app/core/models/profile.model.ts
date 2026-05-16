export interface ProfileResponse {
  cpf: string;
  email: string;
  nomeCompleto: string;
  telefone: string;
}

export interface ProfileUpdateRequest {
  nomeCompleto: string;
  cpf: string;
  email: string;
  telefone: string;
}

export interface PasswordChangeRequest {
  senhaAtual: string;
  novaSenha: string;
  confirmarNovaSenha: string;
}

export interface CreateFamilyRequest {
  nome: string;
}

export interface FamilyResponse {
  id: number;
  nome: string;
  titular: FamilyMemberResponse;
  membros: FamilyMemberResponse[];
}

export interface FamilyMemberResponse {
  id: number;
  nomeCompleto: string;
  email: string;
  parentesco: ParentescoEnum;
  status: FamilyMemberStatusEnum;
}

export interface FamilyUpdateMemberRequest {
  parentesco?: ParentescoEnum;
  status?: FamilyMemberStatusEnum;
}

export interface FamilyInvitationSendRequest {
  receiverEmail: string;
  parentesco: ParentescoEnum;
}

export interface FamilyInvitationResponse {
  id: number;
  requesterNome: string;
  receiverEmail: string;
  parentesco: ParentescoEnum;
  status: InvitationStatusEnum;
  createdAt: string;
}

export type ParentescoEnum =
  | 'TITULAR'
  | 'CONJUGE'
  | 'FILHO'
  | 'FILHA'
  | 'PAI'
  | 'MAE'
  | 'IRMAO'
  | 'IRMA'
  | 'OUTRO';

export type FamilyMemberStatusEnum = 'ATIVO' | 'INATIVO';

export type InvitationStatusEnum =
  | 'AGUARDANDO_TITULAR'
  | 'PENDENTE'
  | 'ACEITO'
  | 'RECUSADO';
