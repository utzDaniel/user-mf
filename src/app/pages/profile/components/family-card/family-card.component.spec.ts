import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';

import { FamilyCardComponent } from './family-card.component';
import { ProfileService } from '../../../../core/services/profile.service';
import {
  FamilyResponse,
  FamilyMemberResponse,
  FamilyInvitationResponse,
} from '../../../../core/models/profile.model';

const mockTitular: FamilyMemberResponse = {
  id: 1,
  nomeCompleto: 'João Silva',
  email: 'joao@email.com',
  parentesco: 'TITULAR',
  status: 'ATIVO',
};

const mockMembro: FamilyMemberResponse = {
  id: 2,
  nomeCompleto: 'Carlos Silva',
  email: 'carlos@email.com',
  parentesco: 'FILHO',
  status: 'ATIVO',
};

const mockFamily: FamilyResponse = {
  id: 1,
  nome: 'Família Silva',
  titular: mockTitular,
  membros: [mockMembro],
};

const mockInvitation: FamilyInvitationResponse = {
  id: 1,
  requesterNome: 'João Silva',
  receiverEmail: 'maria@email.com',
  parentesco: 'CONJUGE',
  status: 'PENDENTE',
  createdAt: '2026-05-16T10:00:00Z',
};

describe('FamilyCardComponent', () => {
  let component: FamilyCardComponent;
  let fixture: ComponentFixture<FamilyCardComponent>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    mockProfileService = jasmine.createSpyObj('ProfileService', [
      'getFamily',
      'createFamily',
      'updateFamilyMember',
      'removeFamilyMember',
      'requestInvitation',
      'listReceivedInvitations',
      'listSentInvitations',
      'acceptInvitation',
      'rejectInvitation',
    ]);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    mockProfileService.getFamily.and.returnValue(of(mockFamily));
    mockProfileService.listReceivedInvitations.and.returnValue(of([mockInvitation]));
    mockProfileService.listSentInvitations.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [FamilyCardComponent, NoopAnimationsModule],
      providers: [
        { provide: ProfileService, useValue: mockProfileService },
        { provide: MessageService, useValue: mockMessageService },
        ConfirmationService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FamilyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load family on init', () => {
    expect(mockProfileService.getFamily).toHaveBeenCalledTimes(1);
    expect(component.hasFamily()).toBeTrue();
    expect(component.family()).toEqual(mockFamily);
  });

  it('should set hasFamily to false when getFamily returns 404', async () => {
    mockProfileService.getFamily.and.returnValue(throwError(() => ({ status: 404 })));
    component.ngOnInit();
    expect(component.hasFamily()).toBeFalse();
  });

  it('should compute allMembers as titular + membros', () => {
    expect(component.allMembers().length).toBe(2);
    expect(component.allMembers()[0]).toEqual(mockTitular);
    expect(component.allMembers()[1]).toEqual(mockMembro);
  });

  it('should load received invitations on init', () => {
    expect(mockProfileService.listReceivedInvitations).toHaveBeenCalledTimes(1);
    expect(component.receivedInvitations()).toEqual([mockInvitation]);
  });

  it('should identify titular correctly', () => {
    expect(component.isTitular(mockTitular)).toBeTrue();
    expect(component.isTitular(mockMembro)).toBeFalse();
  });

  it('should return correct status severity', () => {
    expect(component.getStatusSeverity('ATIVO')).toBe('success');
    expect(component.getStatusSeverity('INATIVO')).toBe('secondary');
  });

  it('should return correct initials', () => {
    expect(component.getInitials('João Silva')).toBe('JS');
    expect(component.getInitials('Carlos')).toBe('C');
  });

  it('should open create family dialog', () => {
    component.openCreateFamily();
    expect(component.createFamilyVisible()).toBeTrue();
  });

  it('should open add member dialog', () => {
    component.openAddMember();
    expect(component.addMemberVisible()).toBeTrue();
  });

  it('should create family and reload on success', () => {
    mockProfileService.createFamily.and.returnValue(of(mockFamily));
    component.createFamilyForm.setValue({ nome: 'Família Nova' });
    component.submitCreateFamily();
    expect(mockProfileService.createFamily).toHaveBeenCalledWith({ nome: 'Família Nova' });
    expect(component.createFamilyVisible()).toBeFalse();
    expect(mockMessageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'success' })
    );
  });

  it('should not create family when form is invalid', () => {
    component.createFamilyForm.reset();
    component.submitCreateFamily();
    expect(mockProfileService.createFamily).not.toHaveBeenCalled();
  });

  it('should accept invitation and reload family', () => {
    mockProfileService.acceptInvitation.and.returnValue(of(mockInvitation));
    component.acceptInvitation(1);
    expect(mockProfileService.acceptInvitation).toHaveBeenCalledWith(1);
    expect(mockMessageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'success' })
    );
  });

  it('should reject invitation and reload received list', () => {
    mockProfileService.rejectInvitation.and.returnValue(of(mockInvitation));
    component.rejectInvitation(1);
    expect(mockProfileService.rejectInvitation).toHaveBeenCalledWith(1);
    expect(mockProfileService.listReceivedInvitations).toHaveBeenCalled();
  });

  it('should open edit member dialog with member data', () => {
    component.openEditMember(mockMembro);
    expect(component.editMemberVisible()).toBeTrue();
    expect(component.editingMemberId()).toBe(2);
    expect(component.editMemberForm.value.parentesco).toBe('FILHO');
    expect(component.editMemberForm.value.status).toBe('ATIVO');
  });

  it('should submit edit member and reload family on success', () => {
    mockProfileService.updateFamilyMember.and.returnValue(of(mockMembro));
    component.openEditMember(mockMembro);
    component.submitEditMember();
    expect(mockProfileService.updateFamilyMember).toHaveBeenCalledWith(
      2,
      jasmine.objectContaining({ parentesco: 'FILHO', status: 'ATIVO' })
    );
    expect(component.editMemberVisible()).toBeFalse();
  });

  it('should send invitation and close dialog on success', () => {
    mockProfileService.requestInvitation.and.returnValue(of(mockInvitation));
    mockProfileService.listSentInvitations.and.returnValue(of([]));
    component.addMemberForm.setValue({
      receiverEmail: 'maria@email.com',
      parentesco: 'CONJUGE',
    });
    component.submitAddMember();
    expect(mockProfileService.requestInvitation).toHaveBeenCalledWith({
      receiverEmail: 'maria@email.com',
      parentesco: 'CONJUGE',
    });
    expect(component.addMemberVisible()).toBeFalse();
  });

  it('should return correct parentesco label', () => {
    expect(component.parentescoLabel('CONJUGE')).toBe('Cônjuge');
    expect(component.parentescoLabel('TITULAR')).toBe('Titular');
    expect(component.parentescoLabel('FILHO')).toBe('Filho');
  });
});
