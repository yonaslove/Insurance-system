import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  const expectedRoles = route.data?.['roles'] as UserRole[] | undefined;
  if (!expectedRoles || expectedRoles.length === 0) {
    return true;
  }

  if (authService.hasAnyRole(expectedRoles)) {
    return true;
  }

  // Not authorized for this specific route, redirect to their assigned responsibility page
  const user = authService.currentUser();
  const primaryRole = user?.roles[0] || 'CUSTOMER';
  const targetUrl = authService.getRedirectUrlForRole(primaryRole);

  return router.createUrlTree([targetUrl]);
};
