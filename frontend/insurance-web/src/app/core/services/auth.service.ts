import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {
  UserProfile,
  UserRole,
  CustomerRegisterRequest,
  AdminCreateUserRequest,
  UserAccount
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private usersListSignal = signal<UserAccount[]>([]);
  private currentUserSignal = signal<UserProfile | null>(this.getInitialUser());

  currentUser = computed(() => this.currentUserSignal());
  isAuthenticated = computed(() => !!this.currentUserSignal());
  allUsers = computed(() => this.usersListSignal());

  private getInitialUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem('insuredge_auth_user');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return null;
  }

  getToken(): string | null {
    try {
      return localStorage.getItem('insuredge_auth_token');
    } catch {
      return null;
    }
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUserSignal();
    return user ? user.roles.includes(role) : false;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.currentUserSignal();
    return user ? roles.some(r => user.roles.includes(r)) : false;
  }

  /**
   * Log in with real credentials against /api/v1/auth/login.
   * Stores real Keycloak JWT access token in localStorage for authorization headers.
   */
  login(usernameOrEmail: string, password: string): Observable<{ user: UserProfile; redirectUrl: string }> {
    const trimmedInput = usernameOrEmail.trim();

    return this.http.post<any>('/api/v1/auth/login', {
      usernameOrEmail: trimmedInput,
      password: password
    }).pipe(
      tap(res => {
        const profile: UserProfile = {
          id: res.id,
          username: res.username,
          name: res.fullName,
          email: res.email,
          roles: [res.role as UserRole],
          customerId: res.customerId,
          status: res.status
        };

        if (res.token) {
          try {
            localStorage.setItem('insuredge_auth_token', res.token);
          } catch {
            // Ignored
          }
        }

        this.setCurrentUser(profile);
      }),
      catchError((httpErr) => {
        const msg = httpErr?.error?.message || httpErr?.error?.detail || httpErr?.message || 'Invalid username/email or password.';
        return throwError(() => new Error(msg));
      })
    );
  }

  /**
   * Special case: Customer self-registration against /api/v1/auth/register.
   */
  registerCustomer(request: CustomerRegisterRequest): Observable<{ user: UserProfile; redirectUrl: string }> {
    return this.http.post<any>('/api/v1/auth/register', request).pipe(
      tap(res => {
        const profile: UserProfile = {
          id: res.id,
          username: res.username,
          name: res.fullName,
          email: res.email,
          roles: ['CUSTOMER'],
          customerId: res.customerId,
          status: res.status || 'PENDING_APPROVAL'
        };

        if (res.token) {
          try {
            localStorage.setItem('insuredge_auth_token', res.token);
          } catch {
            // Ignored
          }
        }

        this.setCurrentUser(profile);
      }),
      catchError((httpErr) => {
        const msg = httpErr?.error?.message || 'Customer registration failed. Username or email may already be registered.';
        return throwError(() => new Error(msg));
      })
    );
  }

  /**
   * Request password reset verification code by email or username.
   */
  forgotPassword(usernameOrEmail: string): Observable<{ message: string; email?: string }> {
    return this.http.post<{ message: string; email?: string }>('/api/v1/auth/forgot-password', {
      usernameOrEmail: usernameOrEmail.trim()
    }).pipe(
      catchError((httpErr) => {
        const msg = httpErr?.error?.message || httpErr?.error?.detail || httpErr?.message || 'Unable to process password reset request.';
        return throwError(() => new Error(msg));
      })
    );
  }

  /**
   * Reset user password using verification code and unlock account.
   */
  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/v1/auth/reset-password', {
      token: token.trim(),
      newPassword: newPassword
    }).pipe(
      catchError((httpErr) => {
        const msg = httpErr?.error?.message || httpErr?.error?.detail || httpErr?.message || 'Failed to reset password. Please check your verification code.';
        return throwError(() => new Error(msg));
      })
    );
  }

  /**
   * Administrator operation: Add any actor into the real database and Keycloak (/api/v1/auth/users).
   */
  adminCreateUser(request: AdminCreateUserRequest): Observable<UserAccount> {
    return this.http.post<UserAccount>('/api/v1/auth/users', request).pipe(
      tap(savedUser => {
        this.usersListSignal.update(list => [savedUser, ...list]);
      }),
      catchError((httpErr) => {
        const msg = httpErr?.error?.message || 'Failed to provision actor in database. Username or email may already exist.';
        return throwError(() => new Error(msg));
      })
    );
  }

  /**
   * Administrator operation: Load all real system actors from database (/api/v1/auth/users).
   */
  getUsers(role?: string): Observable<UserAccount[]> {
    const params = role && role !== 'ALL' ? `?role=${encodeURIComponent(role)}` : '';
    return this.http.get<UserAccount[]>(`/api/v1/auth/users${params}`).pipe(
      tap(users => {
        if (!role || role === 'ALL') {
          this.usersListSignal.set(users);
        }
      }),
      catchError(() => of(this.usersListSignal()))
    );
  }

  private setCurrentUser(user: UserProfile) {
    this.currentUserSignal.set(user);
    try {
      localStorage.setItem('insuredge_auth_user', JSON.stringify(user));
    } catch {
      // Ignored
    }
  }

  logout() {
    this.currentUserSignal.set(null);
    try {
      localStorage.removeItem('insuredge_auth_user');
      localStorage.removeItem('insuredge_auth_token');
    } catch {
      // Ignored
    }
    this.router.navigate(['/login']);
  }

  getRedirectUrlForRole(role: UserRole): string {
    switch (role) {
      case 'CUSTOMER':
        return '/portal';
      case 'UNDERWRITER':
        return '/policies';
      case 'CLAIMS_OFFICER':
        return '/claims';
      case 'FINANCE_OFFICER':
        return '/payments';
      case 'CUSTOMER_SERVICE':
        return '/customers';
      case 'ADMIN':
      default:
        return '/dashboard';
    }
  }
}
