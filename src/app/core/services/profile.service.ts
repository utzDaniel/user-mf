import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
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

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUserUrl}/api/v1/profile`;

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(this.baseUrl);
  }

  updateProfile(req: ProfileUpdateRequest): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(this.baseUrl, req);
  }

  changePassword(req: PasswordChangeRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/password`, req);
  }

  createFamily(req: CreateFamilyRequest): Observable<FamilyResponse> {
    return this.http.post<FamilyResponse>(`${this.baseUrl}/family`, req);
  }

  getFamily(): Observable<FamilyResponse> {
    return this.http.get<FamilyResponse>(`${this.baseUrl}/family`);
  }

  updateFamilyMember(id: number, req: FamilyUpdateMemberRequest): Observable<FamilyMemberResponse> {
    return this.http.put<FamilyMemberResponse>(`${this.baseUrl}/family/members/${id}`, req);
  }

  removeFamilyMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/family/members/${id}`);
  }

  requestInvitation(req: FamilyInvitationSendRequest): Observable<FamilyInvitationResponse> {
    return this.http.post<FamilyInvitationResponse>(`${this.baseUrl}/family/invitations`, req);
  }

  listReceivedInvitations(): Observable<FamilyInvitationResponse[]> {
    return this.http.get<FamilyInvitationResponse[]>(`${this.baseUrl}/family/invitations/received`);
  }

  listSentInvitations(): Observable<FamilyInvitationResponse[]> {
    return this.http.get<FamilyInvitationResponse[]>(`${this.baseUrl}/family/invitations/sent`);
  }

  approveInvitation(id: number): Observable<FamilyInvitationResponse> {
    return this.http.put<FamilyInvitationResponse>(`${this.baseUrl}/family/invitations/${id}/approve`, {});
  }

  rejectInvitationByTitular(id: number): Observable<FamilyInvitationResponse> {
    return this.http.put<FamilyInvitationResponse>(`${this.baseUrl}/family/invitations/${id}/reject-titular`, {});
  }

  acceptInvitation(id: number): Observable<FamilyInvitationResponse> {
    return this.http.put<FamilyInvitationResponse>(`${this.baseUrl}/family/invitations/${id}/accept`, {});
  }

  rejectInvitation(id: number): Observable<FamilyInvitationResponse> {
    return this.http.put<FamilyInvitationResponse>(`${this.baseUrl}/family/invitations/${id}/reject`, {});
  }
}
