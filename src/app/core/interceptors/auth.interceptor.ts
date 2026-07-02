import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    
    // Clonar request e adicionar token se existir
    if (token) {
      // Verifica se é FormData para não forçar Content-Type JSON
      const isFormData = request.body instanceof FormData;
      
      const headers: any = {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      };

      // Só adiciona Content-Type JSON se NÃO for FormData
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      request = request.clone({
        setHeaders: headers
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.clearAuth();
          this.router.navigate(['/auth/login']);
        }
        return throwError(() => error);
      })
    );
  }
}