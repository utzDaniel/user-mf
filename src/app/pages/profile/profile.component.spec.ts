import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { ProfileComponent } from './profile.component';
import { ProfileService } from '../../core/services/profile.service';
import { ProfileResponse } from '../../core/models/profile.model';

const mockProfile: ProfileResponse = {
  cpf: '123.456.789-00',
  email: 'joao@email.com',
  nomeCompleto: 'João Silva',
  telefone: '11999999999',
};

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;

  beforeEach(async () => {
    mockProfileService = jasmine.createSpyObj('ProfileService', [
      'getProfile',
      'updateProfile',
      'changePassword',
      'getFamily',
      'createFamily',
      'updateFamilyMember',
      'removeFamilyMember',
      'requestInvitation',
      'listReceivedInvitations',
      'listSentInvitations',
      'approveInvitation',
      'rejectInvitationByTitular',
      'acceptInvitation',
      'rejectInvitation',
    ]);
    mockProfileService.getProfile.and.returnValue(of(mockProfile));
    mockProfileService.getFamily.and.returnValue(throwError(() => ({ status: 404 })));
    mockProfileService.listReceivedInvitations.and.returnValue(of([]));
    mockProfileService.listSentInvitations.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, NoopAnimationsModule],
      providers: [{ provide: ProfileService, useValue: mockProfileService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile on init', () => {
    expect(mockProfileService.getProfile).toHaveBeenCalledTimes(1);
    expect(component.profile()).toEqual(mockProfile);
  });

  it('should update profile signal when onProfileUpdated is called', () => {
    const updated: ProfileResponse = { ...mockProfile, nomeCompleto: 'João Updated' };
    component.onProfileUpdated(updated);
    expect(component.profile()).toEqual(updated);
  });
});
