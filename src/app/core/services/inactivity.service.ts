import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, interval, Subscription, fromEvent, merge } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  // ⚙️ CONFIGURAÇÃO
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos em ms
  private readonly WARNING_BEFORE_LOGOUT = 60 * 1000; // 60 segundos antes
  private readonly HEARTBEAT_INTERVAL = 60 * 1000; // Heartbeat a cada 60s
  private readonly CHECK_INTERVAL = 10 * 1000; // Verificar a cada 10s

  // ✅ Eventos que consideramos "atividade"
  private readonly ACTIVITY_EVENTS = [
    'mousemove', 'mousedown', 'keydown', 'scroll', 
    'touchstart', 'click', 'keypress'
  ];

  // Subjects públicos
  public showWarning$ = new BehaviorSubject<boolean>(false);
  public secondsRemaining$ = new BehaviorSubject<number>(0);
  public isActive$ = new BehaviorSubject<boolean>(true);

  // Estado interno
  private lastActivityTime: number = Date.now();
  private warningTimeout: any = null;
  private logoutTimeout: any = null;
  private heartbeatSubscription?: Subscription;
  private checkSubscription?: Subscription;
  private countdownSubscription?: Subscription;
  private eventListeners: (() => void)[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  /**
   * Iniciar monitorização de inatividade
   */
  start(): void {
    if (!this.authService.isAuthenticated()) return;

    console.log('🔒 InactivityService iniciado');
    this.resetActivity();
    this.setupEventListeners();
    this.startHeartbeat();
    this.startCheckInterval();
  }

  /**
   * Parar monitorização
   */
  stop(): void {
    console.log('🔓 InactivityService parado');
    
    this.eventListeners.forEach(unsubscribe => unsubscribe());
    this.eventListeners = [];
    
    if (this.heartbeatSubscription) this.heartbeatSubscription.unsubscribe();
    if (this.checkSubscription) this.checkSubscription.unsubscribe();
    if (this.countdownSubscription) this.countdownSubscription.unsubscribe();
    
    clearTimeout(this.warningTimeout);
    clearTimeout(this.logoutTimeout);
    
    this.showWarning$.next(false);
    this.isActive$.next(true);
  }

  /**
   * Reset da atividade (utilizador fez algo)
   */
  private resetActivity(): void {
    this.lastActivityTime = Date.now();
    this.isActive$.next(true);
    this.showWarning$.next(false);
    
    clearTimeout(this.warningTimeout);
    clearTimeout(this.logoutTimeout);
    
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }

    // Agendar aviso
    const warningTime = this.INACTIVITY_TIMEOUT - this.WARNING_BEFORE_LOGOUT;
    this.warningTimeout = setTimeout(() => {
      this.showWarning();
    }, warningTime);

    // Agendar logout
    this.logoutTimeout = setTimeout(() => {
      this.performLogout();
    }, this.INACTIVITY_TIMEOUT);
  }

  /**
   * Mostrar aviso de inatividade
   */
  private showWarning(): void {
    this.showWarning$.next(true);
    this.startCountdown();
  }

  /**
   * Iniciar contagem regressiva
   */
  private startCountdown(): void {
    const seconds = Math.floor(this.WARNING_BEFORE_LOGOUT / 1000);
    this.secondsRemaining$.next(seconds);

    this.countdownSubscription = interval(1000).subscribe(() => {
      const remaining = this.secondsRemaining$.value - 1;
      this.secondsRemaining$.next(remaining);

      if (remaining <= 0) {
        this.countdownSubscription?.unsubscribe();
      }
    });
  }

  /**
   * Estender sessão (utilizador clicou em "Continuar")
   */
  extendSession(): void {
    console.log('⏰ Sessão estendida pelo utilizador');
    
    this.http.post('/api/auth/heartbeat', {}).subscribe({
      next: () => {
        this.resetActivity();
        this.showWarning$.next(false);
      },
      error: (err) => {
        console.error('Erro ao estender sessão', err);
        this.performLogout();
      }
    });
  }

  /**
   * Fazer logout por inatividade
   */
  private performLogout(): void {
    console.warn('⚠️ Logout por inatividade');
    this.isActive$.next(false);
    
    // Guardar motivo do logout
    sessionStorage.setItem('logout_reason', 'inactivity');
    
    this.authService.logout().subscribe({
      next: () => {
        this.stop();
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // Mesmo com erro, limpar e redirecionar
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.stop();
        this.router.navigate(['/auth/login']);
      }
    });
  }

  /**
   * Setup dos event listeners de atividade
   */
  private setupEventListeners(): void {
    // ✅ Executar fora do NgZone para melhor performance
    this.ngZone.runOutsideAngular(() => {
      this.ACTIVITY_EVENTS.forEach(event => {
        const handler = () => {
          // Só reset se passou mais de 5 segundos desde a última atividade
          if (Date.now() - this.lastActivityTime > 5000) {
            this.ngZone.run(() => this.resetActivity());
          } else {
            this.lastActivityTime = Date.now();
          }
        };

        document.addEventListener(event, handler, { passive: true });
        this.eventListeners.push(() => document.removeEventListener(event, handler));
      });
    });
  }

  /**
   * Heartbeat periódico para manter sessão ativa no backend
   */
  private startHeartbeat(): void {
    this.heartbeatSubscription = interval(this.HEARTBEAT_INTERVAL).subscribe(() => {
      // Só enviar heartbeat se há atividade recente
      const timeSinceActivity = Date.now() - this.lastActivityTime;
      if (timeSinceActivity < this.HEARTBEAT_INTERVAL * 2) {
        this.http.post('/api/auth/heartbeat', {}).subscribe({
          error: (err) => console.error('Heartbeat falhou', err)
        });
      }
    });
  }

  /**
   * Verificar periodicamente se a sessão ainda é válida no backend
   */
  private startCheckInterval(): void {
    this.checkSubscription = interval(this.CHECK_INTERVAL).subscribe(() => {
      this.http.get<any>('/api/auth/session').subscribe({
        next: (data) => {
          if (!data.active) {
            this.performLogout();
          }
        },
        error: (err) => {
          // Se der 401, sessão expirou
          if (err.status === 401 && err.error?.error_code === 'INACTIVITY_TIMEOUT') {
            this.performLogout();
          }
        }
      });
    });
  }

  /**
   * Getter para o tempo de timeout (em minutos)
   */
  getTimeoutMinutes(): number {
    return this.INACTIVITY_TIMEOUT / 1000 / 60;
  }
}