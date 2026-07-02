import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User, AuthResponse } from '../models/user.model';
import { LoginCredentials, RegisterData } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.setAuth(response);
      }),
      catchError(this.handleError)
    );
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => {
        this.setAuth(response);
      }),
      catchError(this.handleError)
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearAuth();
      }),
      catchError(this.handleError)
    );
  }

  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/user`).pipe(
      tap(response => {
        this.userSubject.next(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      }),
      catchError(this.handleError)
    );
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  private setAuth(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.userSubject.next(response.user);
  }

  public clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  private loadUserFromStorage(): void {
    const user = localStorage.getItem('user');
    if (user) {
      this.userSubject.next(JSON.parse(user));
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido!';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.errors) {
        // Erros de validação
        const errors = Object.values(error.error.errors).flat();
        errorMessage = errors.join('\n');
      } else {
        errorMessage = `Código do erro: ${error.status}\nMensagem: ${error.message}`;
      }
    }
    
    console.error('Erro na API:', error);
    return throwError(() => new Error(errorMessage));
  }
}