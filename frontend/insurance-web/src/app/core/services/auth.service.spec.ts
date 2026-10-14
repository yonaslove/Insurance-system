import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
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
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should log in with admin credentials and store the token', () => {
    service.login('admin', 'Admin123!').subscribe(result => {
      expect(result.user.roles).toContain('ADMIN');
      expect(result.redirectUrl).toBe('/dashboard');
    });

    const req = httpMock.expectOne('/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({
      id: '10000000-0000-0000-0000-000000000001',
      username: 'admin',
      email: 'admin@insurance-corp.com',
      fullName: 'System Administrator',
      role: 'ADMIN',
      token: 'test-token',
      redirectUrl: '/dashboard',
      status: 'ACTIVE'
    });

    expect(service.isAuthenticated()).toBeTrue();
    expect(localStorage.getItem('insuredge_auth_token')).toBe('test-token');
  });

  it('should reject invalid credentials', () => {
    let errored = false;
    service.login('admin', 'WrongPass!').subscribe({
      error: () => { errored = true; }
    });

    const req = httpMock.expectOne('/api/v1/auth/login');
    req.flush({ message: 'Invalid username/email or password' }, { status: 401, statusText: 'Unauthorized' });

    expect(errored).toBeTrue();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should clear user on logout and navigate to login', () => {
    service.login('admin', 'Admin123!').subscribe();
    httpMock.expectOne('/api/v1/auth/login').flush({
      id: '10000000-0000-0000-0000-000000000001',
      username: 'admin',
      email: 'admin@insurance-corp.com',
      fullName: 'System Administrator',
      role: 'ADMIN',
      token: 'test-token',
      redirectUrl: '/dashboard',
      status: 'ACTIVE'
    });

    expect(service.isAuthenticated()).toBeTrue();

    service.logout();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUser()).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
