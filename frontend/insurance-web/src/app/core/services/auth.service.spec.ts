import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    localStorage.clear();
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should allow logging in with admin credentials', (done) => {
    service.login('admin', 'Admin123!').subscribe(result => {
      expect(result.user.roles).toContain('ADMIN');
      expect(service.isAuthenticated()).toBeTrue();
      expect(result.redirectUrl).toBe('/dashboard');
      done();
    });
  });

  it('should reject invalid credentials', (done) => {
    service.login('admin', 'WrongPass!').subscribe({
      next: () => fail('Should have failed'),
      error: (err) => {
        expect(err).toBeTruthy();
        done();
      }
    });
  });

  it('should clear user on logout and navigate to login', () => {
    service.loginAsAdmin();
    expect(service.isAuthenticated()).toBeTrue();
    service.logout();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUser()).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
