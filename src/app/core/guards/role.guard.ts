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

  // Se não houver roles definidas na rota, permite acesso a qualquer autenticado
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  if (requiredRoles.includes(user.role || '')) {
    return true;
  }

  // Redirecionar para dashboard se não tiver permissão
  router.navigate(['/dashboard']);
  return false;
};