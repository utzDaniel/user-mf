import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnChanges {
  @Input() userId?: number;
  @Input() visible = false;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  isLoading = signal(false);
  dialogVisible = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
  });

  get isEditMode(): boolean {
    return this.userId !== undefined;
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'Editar Usuário' : 'Novo Usuário';
  }

  ngOnChanges(): void {
    this.dialogVisible.set(this.visible);
    if (this.visible) {
      this.form.reset();
      if (this.isEditMode && this.userId) {
        this.loadUser(this.userId);
      }
    }
  }

  private loadUser(id: number): void {
    this.isLoading.set(true);
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.form.patchValue({ name: user.name, email: user.email });
        this.isLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar dados do usuário',
        });
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email } = this.form.value as { name: string; email: string };
    this.isLoading.set(true);

    const request$ =
      this.isEditMode && this.userId
        ? this.userService.updateUser(this.userId, { name, email })
        : this.userService.createUser({ name, email });

    request$.subscribe({
      next: () => {
        this.isLoading.set(false);
        this.saved.emit();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao salvar usuário',
        });
        this.isLoading.set(false);
      },
    });
  }

  onVisibleChange(value: boolean): void {
    if (!value) {
      this.dialogVisible.set(false);
      this.cancelled.emit();
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
