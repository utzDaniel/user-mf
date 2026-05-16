import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';

import { ProfileService } from '../../../../core/services/profile.service';
import {
  FamilyResponse,
  FamilyMemberResponse,
  FamilyInvitationResponse,
  ParentescoEnum,
  FamilyMemberStatusEnum,
} from '../../../../core/models/profile.model';

@Component({
  selector: 'app-family-card',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    TagModule,
    MenuModule,
    AvatarModule,
    InputTextModule,
    SelectModule,
    ConfirmDialogModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
  ],
  providers: [ConfirmationService],
  templateUrl: './family-card.component.html',
  styles: [`
    :host { display: block; }
    .card { border: 1px solid #e5e7eb; border-radius: .75rem; background: #fff; padding: 1rem; }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: .25rem; }
    .card-title { font-size: 1.25rem; font-weight: 600; margin: 0; }
    .card-subtitle { font-size: .875rem; color: #6b7280; margin: .25rem 0 0 0; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 0; gap: .75rem; }
    .empty-icon { font-size: 3rem; color: #9ca3af; }
    .empty-text { color: #6b7280; margin: 0; }
    .dialog-body { display: flex; flex-direction: column; gap: .75rem; padding: .75rem; }
    .dialog-group { display: flex; flex-direction: column; gap: .25rem; }
    .dialog-group label { font-size: .875rem; font-weight: 500; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: .5rem; padding: 0 .75rem .75rem; }
  `],
})
export class FamilyCardComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);

  family = signal<FamilyResponse | null>(null);
  hasFamily = signal(false);
  receivedInvitations = signal<FamilyInvitationResponse[]>([]);
  sentInvitations = signal<FamilyInvitationResponse[]>([]);

  allMembers = computed<FamilyMemberResponse[]>(() => {
    const f = this.family();
    if (!f) return [];
    return [f.titular, ...f.membros];
  });

  // Dialogs
  createFamilyVisible = signal(false);
  addMemberVisible = signal(false);
  editMemberVisible = signal(false);

  // Forms
  createFamilyForm: FormGroup = this.fb.group({
    nome: ['', Validators.required],
  });

  addMemberForm: FormGroup = this.fb.group({
    receiverEmail: ['', [Validators.required, Validators.email]],
    parentesco: [null, Validators.required],
  });

  editMemberForm: FormGroup = this.fb.group({
    parentesco: [null],
    status: [null],
  });

  editingMemberId = signal<number | null>(null);

  // Opções para selects
  parentescoOptions = [
    { label: 'Cônjuge', value: 'CONJUGE' },
    { label: 'Filho', value: 'FILHO' },
    { label: 'Filha', value: 'FILHA' },
    { label: 'Pai', value: 'PAI' },
    { label: 'Mãe', value: 'MAE' },
    { label: 'Irmão', value: 'IRMAO' },
    { label: 'Irmã', value: 'IRMA' },
    { label: 'Outro', value: 'OUTRO' },
  ];

  statusOptions = [
    { label: 'Ativo', value: 'ATIVO' },
    { label: 'Inativo', value: 'INATIVO' },
  ];

  // Menu items (atualizado dinamicamente)
  rowMenuItems = signal<MenuItem[]>([]);

  ngOnInit(): void {
    this.loadFamily();
  }

  loadFamily(): void {
    this.profileService.getFamily().subscribe({
      next: (data) => {
        this.family.set(data);
        this.hasFamily.set(true);
        this.loadInvitations();
      },
      error: (err) => {
        if (err?.status === 404) {
          this.hasFamily.set(false);
        }
      },
    });
  }

  loadInvitations(): void {
    this.profileService.listReceivedInvitations().subscribe({
      next: (data) => this.receivedInvitations.set(data),
    });
    this.profileService.listSentInvitations().subscribe({
      next: (data) => this.sentInvitations.set(data),
    });
  }

  // ---- Criar família ----
  openCreateFamily(): void {
    this.createFamilyForm.reset();
    this.createFamilyVisible.set(true);
  }

  submitCreateFamily(): void {
    if (this.createFamilyForm.invalid) return;
    const { nome } = this.createFamilyForm.getRawValue();
    this.profileService.createFamily({ nome }).subscribe({
      next: () => {
        this.createFamilyVisible.set(false);
        this.hasFamily.set(true);
        this.loadFamily();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Família criada com sucesso',
        });
      },
      error: (err) => {
        const detail = err?.error?.message ?? 'Erro ao criar família';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail });
      },
    });
  }

  // ---- Adicionar familiar ----
  openAddMember(): void {
    this.addMemberForm.reset();
    this.addMemberVisible.set(true);
  }

  submitAddMember(): void {
    if (this.addMemberForm.invalid) return;
    const { receiverEmail, parentesco } = this.addMemberForm.getRawValue();
    this.profileService.requestInvitation({ receiverEmail, parentesco }).subscribe({
      next: () => {
        this.addMemberVisible.set(false);
        this.profileService.listSentInvitations().subscribe({
          next: (data) => this.sentInvitations.set(data),
        });
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Convite enviado com sucesso',
        });
      },
      error: (err) => {
        const detail = err?.error?.message ?? 'Erro ao enviar convite';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail });
      },
    });
  }

  // ---- Menu de membro ----
  openMemberMenu(event: Event, member: FamilyMemberResponse, menu: any): void {
    this.rowMenuItems.set([
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.openEditMember(member),
      },
      {
        label: 'Remover',
        icon: 'pi pi-trash',
        command: () => this.confirmRemoveMember(member),
      },
    ]);
    menu.toggle(event);
  }

  // ---- Editar membro ----
  openEditMember(member: FamilyMemberResponse): void {
    this.editingMemberId.set(member.id);
    this.editMemberForm.setValue({
      parentesco: member.parentesco,
      status: member.status,
    });
    this.editMemberVisible.set(true);
  }

  submitEditMember(): void {
    if (this.editMemberForm.invalid) return;
    const id = this.editingMemberId();
    if (id === null) return;

    const { parentesco, status } = this.editMemberForm.getRawValue();
    this.profileService.updateFamilyMember(id, { parentesco, status }).subscribe({
      next: () => {
        this.editMemberVisible.set(false);
        this.loadFamily();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Membro atualizado com sucesso',
        });
      },
      error: (err) => {
        const detail = err?.error?.message ?? 'Erro ao atualizar membro';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail });
      },
    });
  }

  // ---- Remover membro ----
  confirmRemoveMember(member: FamilyMemberResponse): void {
    this.confirmationService.confirm({
      message: `Deseja remover ${member.nomeCompleto} da família?`,
      header: 'Confirmar remoção',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remover',
      rejectLabel: 'Cancelar',
      accept: () => this.removeMember(member.id),
    });
  }

  removeMember(id: number): void {
    this.profileService.removeFamilyMember(id).subscribe({
      next: () => {
        this.loadFamily();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Membro removido com sucesso',
        });
      },
      error: (err) => {
        const detail = err?.error?.message ?? 'Erro ao remover membro';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail });
      },
    });
  }

  // ---- Convites recebidos ----
  acceptInvitation(id: number): void {
    this.profileService.acceptInvitation(id).subscribe({
      next: () => {
        this.loadFamily();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Convite aceito',
        });
      },
      error: (err) => {
        const detail = err?.error?.message ?? 'Erro ao aceitar convite';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail });
      },
    });
  }

  rejectInvitation(id: number): void {
    this.profileService.rejectInvitation(id).subscribe({
      next: () => {
        this.profileService.listReceivedInvitations().subscribe({
          next: (data) => this.receivedInvitations.set(data),
        });
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Convite recusado',
        });
      },
      error: (err) => {
        const detail = err?.error?.message ?? 'Erro ao recusar convite';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail });
      },
    });
  }

  // ---- Helpers ----
  getInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  isTitular(member: FamilyMemberResponse): boolean {
    return this.family()?.titular?.id === member.id;
  }

  getStatusSeverity(status: FamilyMemberStatusEnum): 'success' | 'secondary' {
    return status === 'ATIVO' ? 'success' : 'secondary';
  }

  parentescoLabel(value: ParentescoEnum): string {
    const map: Record<ParentescoEnum, string> = {
      TITULAR: 'Titular',
      CONJUGE: 'Cônjuge',
      FILHO: 'Filho',
      FILHA: 'Filha',
      PAI: 'Pai',
      MAE: 'Mãe',
      IRMAO: 'Irmão',
      IRMA: 'Irmã',
      OUTRO: 'Outro',
    };
    return map[value] ?? value;
  }
}
