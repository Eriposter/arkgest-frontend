import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class LicenseInterceptor implements HttpInterceptor {
  
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // ✅ Erro 402 = Licença expirada
        if (error.status === 402) {
          const errorData = error.error;
          
          // Guardar info da licença no sessionStorage
          if (errorData.license_info) {
            sessionStorage.setItem('license_expired_info', JSON.stringify(errorData.license_info));
          }
          
          // Redirecionar para página de licença expirada
          // Evitar loop infinito
          if (!this.router.url.includes('/licenca-expirada') && 
              !req.url.includes('/license/current') &&
              !req.url.includes('/auth/logout')) {
            this.router.navigate(['/licenca-expirada']);
          }
        }
        
        // ✅ Tenant cancelado
        if (error.status === 403 && error.error?.error_code === 'TENANT_CANCELLED') {
          sessionStorage.setItem('tenant_cancelled', 'true');
          if (!this.router.url.includes('/conta-cancelada')) {
            this.router.navigate(['/conta-cancelada']);
          }
        }
        
        return throwError(() => error);
      })
    );
  }
}