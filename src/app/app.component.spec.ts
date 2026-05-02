import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { UserService } from './core/services/user.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    const mockUserService = jasmine.createSpyObj('UserService', ['listUsers']);
    mockUserService.listUsers.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AppComponent, NoopAnimationsModule],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
