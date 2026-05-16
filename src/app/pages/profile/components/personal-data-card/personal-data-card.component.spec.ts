import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

import { PersonalDataCardComponent } from './personal-data-card.component';
import { ProfileService } from '../../../../core/services/profile.service';
import { ProfileResponse } from '../../../../core/models/profile.model';

const mockProfile: ProfileResponse = {
  cpf: '123.456.789-00',
  email: 'joao@email.com',
  nomeCompleto: 'João Silva',
  telefone: '11999999999',
};

describe('PersonalDataCardComponent', () => {
  let component: PersonalDataCardComponent;
  let fixture: ComponentFixture<PersonalDataCardComponent>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    mockProfileService = jasmine.createSpyObj('ProfileService', ['updateProfile']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [PersonalDataCardComponent, NoopAnimationsModule],
      providers: [
        { provide: ProfileService, useValue: mockProfileService },
        { provide: MessageService, useValue: mockMessageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonalDataCardComponent);
    component = fixture.componentInstance;
    component.profile = mockProfile;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display profile data in view mode', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('João Silva');
    expect(text).toContain('123.456.789-00');
    expect(text).toContain('joao@email.com');
    expect(text).toContain('11999999999');
  });

  it('should enter edit mode when startEdit is called', () => {
    component.startEdit();
    expect(component.editMode()).toBeTrue();
    expect(component.nomeCompleto).toBe(mockProfile.nomeCompleto);
  });

  it('should cancel edit mode and restore values', () => {
    component.startEdit();
    component.nomeCompleto = 'Outro Nome';
    component.cancel();
    expect(component.editMode()).toBeFalse();
    expect(component.nomeCompleto).toBe(mockProfile.nomeCompleto);
  });

  it('should emit profileUpdated and exit edit mode on successful save', () => {
    const updated: ProfileResponse = { ...mockProfile, nomeCompleto: 'João Atualizado' };
    mockProfileService.updateProfile.and.returnValue(of(updated));
    const emitSpy = spyOn(component.profileUpdated, 'emit');

    component.startEdit();
    component.save();

    expect(emitSpy).toHaveBeenCalledWith(updated);
    expect(component.editMode()).toBeFalse();
    expect(mockMessageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'success' })
    );
  });

  it('should show error toast on failed save', () => {
    mockProfileService.updateProfile.and.returnValue(
      throwError(() => ({ error: { message: 'CPF inválido' } }))
    );

    component.startEdit();
    component.save();

    expect(component.editMode()).toBeTrue();
    expect(mockMessageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error', detail: 'CPF inválido' })
    );
  });
});
