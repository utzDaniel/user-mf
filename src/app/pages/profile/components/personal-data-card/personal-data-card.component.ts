import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

import { ProfileService } from '../../../../core/services/profile.service';
import { ProfileResponse, ProfileUpdateRequest } from '../../../../core/models/profile.model';

@Component({
  selector: 'app-personal-data-card',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
  templateUrl: './personal-data-card.component.html',
  styles: [`
    :host { display: block; height: 100%; }
    .card { border: 1px solid #e5e7eb; border-radius: .75rem; background: #fff; padding: 1rem; height: 100%; box-sizing: border-box; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .card-title { font-size: 1.25rem; font-weight: 600; margin: 0; }
    .fields-list { display: flex; flex-direction: column; gap: .75rem; }
    .field-row { display: flex; align-items: center; gap: .75rem; }
    .field-icon { display: flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; border-radius: .5rem; flex-shrink: 0; }
    .field-label { font-size: .875rem; color: #6b7280; }
    .field-value { font-weight: 500; }
    .edit-fields { display: flex; flex-direction: column; gap: .75rem; }
    .edit-group { display: flex; flex-direction: column; gap: .25rem; }
    .edit-group label { font-size: .875rem; font-weight: 500; }
    .edit-actions { display: flex; gap: .5rem; justify-content: flex-end; margin-top: .5rem; }
  `],
})
export class PersonalDataCardComponent implements OnChanges {
  private readonly profileService = inject(ProfileService);
  private readonly messageService = inject(MessageService);

  @Input({ required: true }) profile!: ProfileResponse;
  @Output() profileUpdated = new EventEmitter<ProfileResponse>();

  editMode = signal(false);
  saving = signal(false);

  nomeCompleto = '';
  cpf = '';
  email = '';
  telefone = '';

  ngOnChanges(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.nomeCompleto = this.profile.nomeCompleto;
    this.cpf = this.profile.cpf;
    this.email = this.profile.email;
    this.telefone = this.profile.telefone;
  }

  startEdit(): void {
    this.resetForm();
    this.editMode.set(true);
  }

  cancel(): void {
    this.resetForm();
    this.editMode.set(false);
  }

  save(): void {
    this.saving.set(true);
    const req: ProfileUpdateRequest = {
      nomeCompleto: this.nomeCompleto,
      cpf: this.cpf,
      email: this.email,
      telefone: this.telefone,
    };
    this.profileService.updateProfile(req).subscribe({
      next: (updated) => {
        this.profileUpdated.emit(updated);
        this.editMode.set(false);
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Dados atualizados com sucesso',
        });
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message ?? 'Erro ao atualizar dados';
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: msg,
        });
      },
    });
  }
}
