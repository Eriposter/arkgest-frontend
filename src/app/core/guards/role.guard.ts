import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const user = authService.getUser();
  const requiredRoles = route.data['roles'] as string[];

  if (!user) {
    router.navigate(['/auth/login']);
    return false;
  }

   if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  if (requiredRoles.includes(user.role || '')) {
    return true;
  }

  // Se for super-admin e tentar aceder a rota normal, redirecionar para super-admin
  if (user.role === 'super-admin') {
    router.navigate(['/super-admin']);
    return false;
  }

  // Se for utilizador normal e tentar aceder a rota do super-admin, redirecionar para dashboard
  router.navigate(['/dashboard']);
  return false;
};