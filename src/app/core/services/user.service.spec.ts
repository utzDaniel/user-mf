import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { UserService } from './user.service';
import { User, UserCreateRequest, UserUpdateRequest } from '../models/user.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:8090/api/v1/users';

  const mockUser: User = {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listUsers', () => {
    it('should return list of users (200)', () => {
      const mockUsers: User[] = [mockUser];

      service.listUsers().subscribe((users) => {
        expect(users).toEqual(mockUsers);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should handle 401 error', () => {
      service.listUsers().subscribe({
        error: (err) => expect(err.status).toBe(401),
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('getUserById', () => {
    it('should return user by id (200)', () => {
      service.getUserById(1).subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle 404 error', () => {
      service.getUserById(999).subscribe({
        error: (err) => expect(err.status).toBe(404),
      });

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createUser', () => {
    it('should create a user (201)', () => {
      const request: UserCreateRequest = { name: 'Bob', email: 'bob@example.com' };
      const created: User = {
        id: 2,
        name: 'Bob',
        email: 'bob@example.com',
        createdAt: '2026-01-02T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
      };

      service.createUser(request).subscribe((user) => {
        expect(user).toEqual(created);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(created, { status: 201, statusText: 'Created' });
    });

    it('should handle 401 error on create', () => {
      service.createUser({ name: 'Bob', email: 'bob@example.com' }).subscribe({
        error: (err) => expect(err.status).toBe(401),
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('updateUser', () => {
    it('should update a user (200)', () => {
      const request: UserUpdateRequest = { name: 'Alice Updated' };
      const updated: User = { ...mockUser, name: 'Alice Updated', updatedAt: '2026-01-03T00:00:00Z' };

      service.updateUser(1, request).subscribe((user) => {
        expect(user).toEqual(updated);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(updated);
    });

    it('should handle 404 error on update', () => {
      service.updateUser(999, { name: 'Ghost' }).subscribe({
        error: (err) => expect(err.status).toBe(404),
      });

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user (204)', () => {
      service.deleteUser(1).subscribe((result) => {
        expect(result).toBeNull();
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('should handle 404 error on delete', () => {
      service.deleteUser(999).subscribe({
        error: (err) => expect(err.status).toBe(404),
      });

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });
});
