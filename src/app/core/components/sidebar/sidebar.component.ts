import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  userName = '';
  
  menuItems = [
    { name: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { name: 'Projetos', icon: 'projects', route: '/projetos' },
    { name: 'Tarefas', icon: 'tasks', route: '/tarefas' },
    { name: 'Clientes', icon: 'clients', route: '/clientes' },
    { name: 'Documentos', icon: 'documents', route: '/documentos' },
    { name: 'Faturas', icon: 'invoices', route: '/faturas', badge: 1 },
    { name: 'Calendário', icon: 'calendar', route: '/calendario' },
    { name: 'Relatórios', icon: 'reports', route: '/relatorios' },
  ];

  constructor(private authService: AuthService) {
    const user = this.authService.getUser();
    this.userName = user?.name || 'Usuário';
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // Redirecionamento é feito pelo interceptor
      }
    });
  }
}