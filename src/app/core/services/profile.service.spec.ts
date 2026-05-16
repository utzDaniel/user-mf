import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ProfileService } from './profile.service';
import {
  ProfileResponse,
  ProfileUpdateRequest,
  PasswordChangeRequest,
  CreateFamilyRequest,
  FamilyResponse,
  FamilyMemberResponse,
  FamilyUpdateMemberRequest,
  FamilyInvitationSendRequest,
  FamilyInvitationResponse,
} from '../models/profile.model';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:8081/api/v1/profile';

  const mockProfile: ProfileResponse = {
    cpf: '123.456.789-00',
    email: 'joao@email.com',
    nomeCompleto: 'João Silva',
    telefone: '11999999999',
  };

  const mockMember: FamilyMemberResponse = {
    id: 1,
    nomeCompleto: 'João Silva',
    email: 'joao@email.com',
    parentesco: 'TITULAR',
    status: 'ATIVO',
  };

  const mockFamily: FamilyResponse = {
    id: 1,
    nome: 'Família Silva',
    titular: mockMember,
    membros: [],
  };

  const mockInvitation: FamilyInvitationResponse = {
    id: 1,
    requesterNome: 'João Silva',
    receiverEmail: 'maria@email.com',
    parentesco: 'CONJUGE',
    status: 'PENDENTE',
    createdAt: '2026-05-16T10:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProfile', () => {
    it('should return profile (200)', () => {
      service.getProfile().subscribe((profile) => {
        expect(profile).toEqual(mockProfile);
      });
      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockProfile);
    });
  });

  describe('updateProfile', () => {
    it('should update profile (200)', () => {
      const updateReq: ProfileUpdateRequest = {
        nomeCompleto: 'João Silva',
        cpf: '123.456.789-00',
        email: 'joao@email.com',
        telefone: '11999999999',
      };
      service.updateProfile(updateReq).subscribe((profile) => {
        expect(profile).toEqual(mockProfile);
      });
      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateReq);
      req.flush(mockProfile);
    });
  });

  describe('changePassword', () => {
    it('should change password (204)', () => {
      const pwReq: PasswordChangeRequest = {
        senhaAtual: 'old123',
        novaSenha: 'new456',
        confirmarNovaSenha: 'new456',
      };
      service.changePassword(pwReq).subscribe((res) => {
        expect(res).toBeNull();
      });
      const req = httpMock.expectOne(`${baseUrl}/password`);
      expect(req.request.method).toBe('PUT');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  describe('createFamily', () => {
    it('should create family (201)', () => {
      const createReq: CreateFamilyRequest = { nome: 'Família Silva' };
      service.createFamily(createReq).subscribe((family) => {
        expect(family).toEqual(mockFamily);
      });
      const req = httpMock.expectOne(`${baseUrl}/family`);
      expect(req.request.method).toBe('POST');
      req.flush(mockFamily, { status: 201, statusText: 'Created' });
    });
  });

  describe('getFamily', () => {
    it('should return family (200)', () => {
      service.getFamily().subscribe((family) => {
        expect(family).toEqual(mockFamily);
      });
      const req = httpMock.expectOne(`${baseUrl}/family`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFamily);
    });

    it('should handle 404 error', () => {
      service.getFamily().subscribe({
        error: (err) => expect(err.status).toBe(404),
      });
      const req = httpMock.expectOne(`${baseUrl}/family`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('updateFamilyMember', () => {
    it('should update member (200)', () => {
      const updateReq: FamilyUpdateMemberRequest = { parentesco: 'FILHO', status: 'ATIVO' };
      service.updateFamilyMember(1, updateReq).subscribe((member) => {
        expect(member).toEqual(mockMember);
      });
      const req = httpMock.expectOne(`${baseUrl}/family/members/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockMember);
    });
  });

  describe('removeFamilyMember', () => {
    it('should remove member (204)', () => {
      service.removeFamilyMember(1).subscribe((res) => {
        expect(res).toBeNull();
      });
      const req = httpMock.expectOne(`${baseUrl}/family/members/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  describe('requestInvitation', () => {
    it('should request invitation (201)', () => {
      const invReq: FamilyInvitationSendRequest = {
        receiverEmail: 'maria@email.com',
        parentesco: 'CONJUGE',
      };
      service.requestInvitation(invReq).subscribe((inv) => {
        expect(inv).toEqual(mockInvitation);
      });
      const req = httpMock.expectOne(`${baseUrl}/family/invitations`);
      expect(req.request.method).toBe('POST');
      req.flush(mockInvitation, { status: 201, statusText: 'Created' });
    });
  });

  describe('listReceivedInvitations', () => {
    it('should list received invitations (200)', () => {
      service.listReceivedInvitations().subscribe((list) => {
        expect(list).toEqual([mockInvitation]);
      });
      const req = httpMock.expectOne(`${baseUrl}/family/invitations/received`);
      expect(req.request.method).toBe('GET');
      req.flush([mockInvitation]);
    });
  });

  describe('listSentInvitations', () => {
    it('should list sent invitations (200)', () => {
      service.listSentInvitations().subscribe((list) => {
        expect(list).toEqual([mockInvitation]);
      });
      const req = httpMock.expectOne(`${baseUrl}/family/invitations/sent`);
      expect(req.request.method).toBe('GET');
      req.flush([mockInvitation]);
    });
  });

  describe('approveInvitation', () => {
    it('should approve invitation (200)', () => {
      service.approveInvitation(1).subscribe((inv) => {
        expect(inv).toEqual(mockInvitation);
      });
      const req = httpMock.expectOne(`${baseUrl}/family/invitations/1/approve`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockInvitation);
    });
  });

  describe('rejectInvitationByTitular', () => {
    it('should reject invitation by titular (200)', () => {
      service.rejectInvitationByTitular(1).subscribe((inv) => {
        expect(inv).toEqual(mockInvitation);
      });
      const req = httpMock.expectOne(`${baseUrl}/family/invitations/1/reject-titular`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockInvitation);
    });
  });

  describe('acceptInvitation', () => {
    it('should accept invitation (200)', () => {
      service.acceptInvitation(1).subscribe((inv) => {
        expect(inv).toEqual(mockInvitation);
      });
      const req = httpMock.expectOne(`${baseUrl}/family/invitations/1/accept`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockInvitation);
    });
  });

  describe('rejectInvitation', () => {
    it('should reject invitation (200)', () => {
      service.rejectInvitation(1).subscribe((inv) => {
        expect(inv).toEqual(mockInvitation);
      });
      const req = httpMock.expectOne(`${baseUrl}/family/invitations/1/reject`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockInvitation);
    });
  });
});
