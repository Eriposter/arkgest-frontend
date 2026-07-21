import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { InactivityService } from './core/services/inactivity.service';
import { InactivityWarningComponent } from './core/components/inactivity-warning/inactivity-warning.component';
import { User } from './core/models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, InactivityWarningComponent],
  template: `
    <router-outlet></router-outlet>
    <app-inactivity-warning></app-inactivity-warning>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  private authSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private inactivityService: InactivityService
  ) {}

  ngOnInit(): void {
    // Iniciar monitorização se autenticado
    if (this.authService.isAuthenticated()) {
      this.inactivityService.start();
    }

    // Observar mudanças de autenticação
    this.authSubscription = this.authService.user$.subscribe((user: User | null) => {
      if (user) {
        // Usuário logou - iniciar monitorização
        this.inactivityService.start();
      } else {
        // Usuário deslogou - parar monitorização
        this.inactivityService.stop();
      }
    });
  }

  ngOnDestroy(): void {
    // Limpar subscription para evitar memory leaks
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    this.inactivityService.stop();
  }
}