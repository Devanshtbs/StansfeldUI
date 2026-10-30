import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AccessRequest {
  accountId: string;
  invitationCode: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  jobTitle: string;
  email: string;
  phone: string;
  region: string;
  countryId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface InvitationValidationResult {
  valid: boolean;
}

export interface InvitationRegistrationInfo {
  accountId: string;
  companyName: string;
  accountNumber: string;
}

export interface CountryOption {
  countryId: string;
  name: string;
}

export interface PortalUser {
  contactId: string;
  fullName: string;
  accountId: string | null;
  accountName: string | null;
}

export interface PortalContactProfile {
  contactId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
}

export interface PortalAccountProfile {
  accountId: string;
  name: string;
  accountNumber: string | null;
  phone: string | null;
  website: string | null;
  city: string | null;
  stateOrProvince: string | null;
  country: string | null;
  postalCode: string | null;
}

export interface PortalProfile {
  user: PortalContactProfile;
  account: PortalAccountProfile | null;
  otherContacts: PortalContactProfile[];
}

export interface ContactProfileInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
}

export interface BusinessReferenceInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
}

export interface AccountProfileInput {
  name: string;
  accountNumber?: string | null;
  phone?: string | null;
  website?: string | null;
  city?: string | null;
  stateOrProvince?: string | null;
  country?: string | null;
  postalCode?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AccessRequestService {
  private readonly http = inject(HttpClient);

  submit(request: AccessRequest): Observable<ApiResponse<{ status: string }>> {
    return this.http.post<ApiResponse<{ status: string }>>(
      `${environment.apiBaseUrl}/access-requests`, request,
    );
  }

  validateInvitation(accountId: string, invitationCode: string): Observable<ApiResponse<InvitationValidationResult>> {
    return this.http.post<ApiResponse<InvitationValidationResult>>(
      `${environment.apiBaseUrl}/invitations/validate`,
      { accountId, invitationCode },
    );
  }

  getInvitationInfo(accountId: string, invitationCode: string): Observable<ApiResponse<InvitationRegistrationInfo>> {
    return this.http.post<ApiResponse<InvitationRegistrationInfo>>(
      `${environment.apiBaseUrl}/invitations/registration-info`, { accountId, invitationCode },
    );
  }

  getCountries(): Observable<ApiResponse<CountryOption[]>> {
    return this.http.get<ApiResponse<CountryOption[]>>(`${environment.apiBaseUrl}/invitations/countries`);
  }

  signIn(username: string, password: string): Observable<ApiResponse<PortalUser>> {
    return this.http.post<ApiResponse<PortalUser>>(
      `${environment.apiBaseUrl}/auth/sign-in`,
      { username, password },
    );
  }

  checkWorkspaceAccess(contactId: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${environment.apiBaseUrl}/auth/workspace-access/${contactId}`);
  }

  getProfile(contactId: string): Observable<ApiResponse<PortalProfile>> {
    return this.http.get<ApiResponse<PortalProfile>>(`${environment.apiBaseUrl}/profile/${contactId}`);
  }

  updateProfile(contactId: string, input: ContactProfileInput): Observable<ApiResponse<object>> {
    return this.http.put<ApiResponse<object>>(`${environment.apiBaseUrl}/profile/${contactId}`, input);
  }

  updateAccount(contactId: string, input: AccountProfileInput): Observable<ApiResponse<object>> {
    return this.http.put<ApiResponse<object>>(`${environment.apiBaseUrl}/profile/${contactId}/account`, input);
  }

  uploadAccountDocument(contactId: string, file: File): Observable<ApiResponse<{ notificationSent: boolean }>> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post<ApiResponse<{ notificationSent: boolean }>>(`${environment.apiBaseUrl}/profile/${contactId}/documents`, form);
  }

  addContact(contactId: string, input: BusinessReferenceInput): Observable<ApiResponse<PortalContactProfile>> {
    return this.http.post<ApiResponse<PortalContactProfile>>(`${environment.apiBaseUrl}/profile/${contactId}/business-references`, input);
  }

  updateContact(contactId: string, relatedContactId: string, input: BusinessReferenceInput): Observable<ApiResponse<object>> {
    return this.http.put<ApiResponse<object>>(`${environment.apiBaseUrl}/profile/${contactId}/business-references/${relatedContactId}`, input);
  }

  deleteContact(contactId: string, relatedContactId: string): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(`${environment.apiBaseUrl}/profile/${contactId}/business-references/${relatedContactId}`);
  }
}
