import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { UserFormComponent } from './user-form.component';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;

  const mockUser: User = {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', [
      'getUserById',
      'createUser',
      'updateUser',
    ]);

    await TestBed.configureTestingModule({
      imports: [UserFormComponent, NoopAnimationsModule],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be in create mode when userId is undefined', () => {
    component.userId = undefined;
    expect(component.isEditMode).toBeFalse();
    expect(component.dialogTitle).toBe('Novo Usuário');
  });

  it('should be in edit mode when userId is defined', () => {
    mockUserService.getUserById.and.returnValue(of(mockUser));
    component.userId = 1;
    component.visible = true;
    component.ngOnChanges();
    expect(component.isEditMode).toBeTrue();
    expect(component.dialogTitle).toBe('Editar Usuário');
  });

  it('should load user data in edit mode', () => {
    mockUserService.getUserById.and.returnValue(of(mockUser));
    component.userId = 1;
    component.visible = true;
    component.ngOnChanges();
    expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
    expect(component.form.value.name).toBe('Alice');
    expect(component.form.value.email).toBe('alice@example.com');
  });

  it('should emit saved event on successful create', () => {
    mockUserService.createUser.and.returnValue(of(mockUser));
    spyOn(component.saved, 'emit');
    component.form.setValue({ name: 'Bob', email: 'bob@example.com' });
    component.onSubmit();
    expect(mockUserService.createUser).toHaveBeenCalledWith({
      name: 'Bob',
      email: 'bob@example.com',
    });
    expect(component.saved.emit).toHaveBeenCalled();
  });

  it('should not submit when form is invalid', () => {
    component.form.setValue({ name: '', email: '' });
    component.onSubmit();
    expect(mockUserService.createUser).not.toHaveBeenCalled();
    expect(mockUserService.updateUser).not.toHaveBeenCalled();
  });

  it('should emit cancelled event on cancel', () => {
    spyOn(component.cancelled, 'emit');
    component.onCancel();
    expect(component.cancelled.emit).toHaveBeenCalled();
  });
});
