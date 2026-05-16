import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';

import { ProfileService } from '../../../../core/services/profile.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const novaSenha = group.get('novaSenha')?.value;
  const confirmar = group.get('confirmarNovaSenha')?.value;
  return novaSenha && confirmar && novaSenha !== confirmar ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-change-password-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, PasswordModule],
  templateUrl: './change-password-card.component.html',
  styles: [`
    :host { display: block; height: 100%; }
    .card { border: 1px solid #e5e7eb; border-radius: .75rem; background: #fff; padding: 1rem; height: 100%; box-sizing: border-box; }
    .card-title { font-size: 1.25rem; font-weight: 600; margin-bottom: .25rem; }
    .card-subtitle { font-size: .875rem; color: #6b7280; margin: 0 0 1rem 0; }
    .pw-form { display: flex; flex-direction: column; gap: .75rem; }
    .pw-group { display: flex; flex-direction: column; gap: .25rem; }
    .pw-group label { font-size: .875rem; font-weight: 500; }
    .error-msg { color: #ef4444; font-size: .875rem; }
    .submit-row { margin-top: .5rem; }
  `],
})
export class ChangePasswordCardComponent {
  private readonly profileService = inject(ProfileService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  form: FormGroup = this.fb.group(
    {
      senhaAtual: ['', Validators.required],
      novaSenha: ['', Validators.required],
      confirmarNovaSenha: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  get submitting(): boolean {
    return this.form.disabled;
  }

  submit(): void {
    if (this.form.invalid) return;

    this.form.disable();
    const { senhaAtual, novaSenha, confirmarNovaSenha } = this.form.getRawValue();

    this.profileService.changePassword({ senhaAtual, novaSenha, confirmarNovaSenha }).subscribe({
      next: () => {
        this.form.enable();
        this.form.reset();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Senha alterada com sucesso',
        });
      },
      error: (err) => {
        this.form.enable();
        let detail = 'Erro ao alterar senha';
        if (err?.status === 400) {
          detail = err?.error?.message ?? detail;
        } else if (err?.status === 502) {
          detail = 'Falha ao comunicar com o servidor';
        }
        this.messageService.add({ severity: 'error', summary: 'Erro', detail });
      },
    });
  }
}
