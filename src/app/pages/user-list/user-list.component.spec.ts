import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { UserListComponent } from './user-list.component';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;

  const mockUsers: User[] = [
    {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Bob',
      email: 'bob@example.com',
      createdAt: '2026-01-02T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', [
      'listUsers',
      'deleteUser',
    ]);
    mockUserService.listUsers.and.returnValue(of(mockUsers));

    await TestBed.configureTestingModule({
      imports: [UserListComponent, NoopAnimationsModule],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(mockUserService.listUsers).toHaveBeenCalledTimes(1);
    expect(component.users()).toEqual(mockUsers);
  });

  it('should render user rows in the table', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(mockUsers.length);
  });

  it('should open form in create mode when "Novo" is triggered', () => {
    component.openCreate();
    expect(component.selectedUserId()).toBeUndefined();
    expect(component.formVisible()).toBeTrue();
  });

  it('should open form in edit mode with user id', () => {
    component.openEdit(mockUsers[0]);
    expect(component.selectedUserId()).toBe(1);
    expect(component.formVisible()).toBeTrue();
  });

  it('should reload users and close form after save', () => {
    component.onFormSaved();
    expect(component.formVisible()).toBeFalse();
    expect(mockUserService.listUsers).toHaveBeenCalledTimes(2);
  });

  it('should close form on cancel', () => {
    component.formVisible.set(true);
    component.onFormCancelled();
    expect(component.formVisible()).toBeFalse();
  });
});
