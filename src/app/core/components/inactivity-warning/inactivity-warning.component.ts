import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { InactivityService } from '../../services/inactivity.service';

@Component({
  selector: 'app-inactivity-warning',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showWarning" 
         class="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      
      <!-- Overlay escuro -->
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      
      <!-- Modal -->
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
        
        <!-- Header com gradiente de alerta -->
        <div class="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 text-white">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold">Sessão a Expirar</h2>
              <p class="text-sm text-white/90">Detectámos inatividade na sua conta</p>
            </div>
          </div>
        </div>

        <!-- Conteúdo -->
        <div class="p-6">
          <p class="text-gray-700 mb-4">
            A sua sessão será encerrada automaticamente por segurança em:
          </p>

          <!-- Countdown grande -->
          <div class="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 text-center mb-4">
            <div class="text-5xl font-bold text-amber-600 tabular-nums">
              {{ secondsRemaining }}
            </div>
            <p class="text-sm text-amber-700 mt-2 font-medium">
              {{ secondsRemaining === 1 ? 'segundo' : 'segundos' }} restantes
            </p>
            
            <!-- Barra de progresso -->
            <div class="w-full bg-amber-100 rounded-full h-2 mt-4 overflow-hidden">
              <div class="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                   [style.width.%]="(secondsRemaining / 60) * 100">
              </div>
            </div>
          </div>

          <p class="text-xs text-gray-500 text-center mb-4">
            💡 Clique em "Continuar Sessão" para manter-se ligado
          </p>

          <!-- Botões -->
          <div class="flex gap-3">
            <button (click)="logoutNow()" 
                    class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              Sair Agora
            </button>
            <button (click)="extendSession()" 
                    class="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg">
              ✅ Continuar Sessão
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
    .animate-slideUp { animation: slideUp 0.3s ease-out; }
  `]
})
export class InactivityWarningComponent implements OnInit, OnDestroy {
  showWarning = false;
  secondsRemaining = 0;
  
  private subscriptions: Subscription[] = [];

  constructor(private inactivityService: InactivityService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.inactivityService.showWarning$.subscribe(show => {
        this.showWarning = show;
      })
    );

    this.subscriptions.push(
      this.inactivityService.secondsRemaining$.subscribe(seconds => {
        this.secondsRemaining = seconds;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  extendSession(): void {
    this.inactivityService.extendSession();
  }

  logoutNow(): void {
    // Forçar logout imediato
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.setItem('logout_reason', 'manual');
    window.location.href = '/auth/login';
  }
}