import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

import { ChangePasswordCardComponent } from './change-password-card.component';
import { ProfileService } from '../../../../core/services/profile.service';

describe('ChangePasswordCardComponent', () => {
  let component: ChangePasswordCardComponent;
  let fixture: ComponentFixture<ChangePasswordCardComponent>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    mockProfileService = jasmine.createSpyObj('ProfileService', ['changePassword']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [ChangePasswordCardComponent, NoopAnimationsModule],
      providers: [
        { provide: ProfileService, useValue: mockProfileService },
        { provide: MessageService, useValue: mockMessageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have form invalid when empty', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('should have passwordMismatch error when passwords differ', () => {
    component.form.setValue({
      senhaAtual: 'old123',
      novaSenha: 'new456',
      confirmarNovaSenha: 'different',
    });
    expect(component.form.hasError('passwordMismatch')).toBeTrue();
  });

  it('should have valid form when all fields are filled and passwords match', () => {
    component.form.setValue({
      senhaAtual: 'old123',
      novaSenha: 'new456',
      confirmarNovaSenha: 'new456',
    });
    expect(component.form.valid).toBeTrue();
  });

  it('should not submit when form is invalid', () => {
    component.submit();
    expect(mockProfileService.changePassword).not.toHaveBeenCalled();
  });

  it('should show success toast and reset form on 204', () => {
    mockProfileService.changePassword.and.returnValue(of(undefined));
    component.form.setValue({
      senhaAtual: 'old123',
      novaSenha: 'new456',
      confirmarNovaSenha: 'new456',
    });

    component.submit();

    expect(mockProfileService.changePassword).toHaveBeenCalledWith({
      senhaAtual: 'old123',
      novaSenha: 'new456',
      confirmarNovaSenha: 'new456',
    });
    expect(mockMessageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'success' })
    );
    expect(component.form.value.senhaAtual).toBeNull();
  });

  it('should show error message from API on 400', () => {
    mockProfileService.changePassword.and.returnValue(
      throwError(() => ({ status: 400, error: { message: 'Senha atual incorreta' } }))
    );
    component.form.setValue({
      senhaAtual: 'wrong',
      novaSenha: 'new456',
      confirmarNovaSenha: 'new456',
    });

    component.submit();

    expect(mockMessageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error', detail: 'Senha atual incorreta' })
    );
  });

  it('should show gateway error message on 502', () => {
    mockProfileService.changePassword.and.returnValue(
      throwError(() => ({ status: 502 }))
    );
    component.form.setValue({
      senhaAtual: 'old123',
      novaSenha: 'new456',
      confirmarNovaSenha: 'new456',
    });

    component.submit();

    expect(mockMessageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error', detail: 'Falha ao comunicar com o servidor' })
    );
  });
});
