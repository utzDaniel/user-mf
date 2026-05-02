import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    UserFormComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  users = signal<User[]>([]);
  selectedUserId = signal<number | undefined>(undefined);
  formVisible = signal(false);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.listUsers().subscribe({
      next: (data) => this.users.set(data),
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar usuários',
        }),
    });
  }

  openCreate(): void {
    this.selectedUserId.set(undefined);
    this.formVisible.set(true);
  }

  openEdit(user: User): void {
    this.selectedUserId.set(user.id);
    this.formVisible.set(true);
  }

  confirmDelete(user: User): void {
    this.confirmationService.confirm({
      message: `Deseja excluir o usuário "${user.name}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteUser(user.id),
    });
  }

  private deleteUser(id: number): void {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Usuário excluído com sucesso',
        });
        this.loadUsers();
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao excluir usuário',
        }),
    });
  }

  onFormSaved(): void {
    this.formVisible.set(false);
    this.loadUsers();
  }

  onFormCancelled(): void {
    this.formVisible.set(false);
  }
}
