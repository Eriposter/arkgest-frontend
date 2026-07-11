import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

// Mapeamento de permissões por Role
// Mapeamento de permissões por Role
const ROLE_PERMISSIONS: { [key: string]: string[] } = {
  'super-admin': ['super-admin-panel', 'tenants', 'licenses'],
  'admin': ['dashboard', 'projetos', 'tarefas', 'clientes', 'documentos', 'faturas', 'calendario', 'relatorios', 'utilizadores', 'configuracoes', 'perfil', 'audit'],
  'gestor': ['dashboard', 'projetos', 'tarefas', 'clientes', 'documentos', 'faturas', 'calendario', 'relatorios', 'perfil'],
  'arquiteto': ['dashboard', 'projetos', 'tarefas', 'documentos', 'calendario', 'perfil'],
  'estagiario': ['dashboard', 'tarefas', 'documentos', 'perfil']
};

interface MenuItem {
  name: string;
  icon: string;
  route: string;
  permission?: string;
  badge?: number;
  badgeColor?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  userName = '';
  userRole = 'estagiario';
  userInitials = '';
  isOpen = false;
  
  pendingTasks = 0;
  
  menuItems: MenuItem[] = [];
  systemItems: MenuItem[] = [];
  superItems: MenuItem[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
  private authService: AuthService,
  private http: HttpClient,
  private router: Router
) {
  const user = this.authService.getUser();
  if (user) {
    this.userName = user.name || 'Usuário';
    // Fallback mais seguro: se não tiver role, assume admin temporariamente
    this.userRole = user.role || 'admin'; // ← MUDAR DE 'estagiario' PARA 'admin'
    this.userInitials = this.getInitials(this.userName);
  }
}

  ngOnInit(): void {
    this.filterMenuByRole();
    this.loadBadges();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  filterMenuByRole(): void {
  const allowedRoutes = ROLE_PERMISSIONS[this.userRole] || [];

  const allMenuItems: MenuItem[] = [
    { name: 'Dashboard', icon: 'dashboard', route: '/dashboard', permission: 'dashboard' },
    { name: 'Projetos', icon: 'projects', route: '/projetos', permission: 'projetos' },
    { name: 'Tarefas', icon: 'tasks', route: '/tarefas', permission: 'tarefas', badgeColor: 'bg-red-500' },
    { name: 'Clientes', icon: 'clients', route: '/clientes', permission: 'clientes', badgeColor: 'bg-yellow-500' },
    { name: 'Documentos', icon: 'documents', route: '/documentos', permission: 'documentos' },
    { name: 'Faturas', icon: 'invoices', route: '/faturas', permission: 'faturas', badgeColor: 'bg-orange-500' },
    { name: 'Calendário', icon: 'calendar', route: '/calendario', permission: 'calendario' },
    { name: 'Relatórios', icon: 'reports', route: '/relatorios', permission: 'relatorios' },
  ];

  const superAdminMenus: MenuItem[] = [
    { name: 'Painel Super Admin', icon: 'super-admin', route: '/super-admin', permission: 'super-admin-panel' },
    { name: 'Empresas', icon: 'building', route: '/super-admin/tenants', permission: 'tenants' },
    { name: 'Licenças', icon: 'license', route: '/super-admin/licenses', permission: 'licenses' },
  ];

  const allSystemItems: MenuItem[] = [
    { name: 'Perfil', icon: 'user', route: '/perfil', permission: 'perfil' },
    { name: 'Configurações', icon: 'settings', route: '/configuracoes', permission: 'configuracoes' },
    { name: 'Utilizadores', icon: 'users', route: '/utilizadores', permission: 'utilizadores' },
    { name: 'Logs de Auditoria', icon: 'audit', route: '/audit', permission: 'audit' },
  ];

  // Filtrar usando permission em vez de route
  this.menuItems = allMenuItems.filter(item => 
    allowedRoutes.includes(item.permission || '')
  );

  this.systemItems = allSystemItems.filter(item => 
    allowedRoutes.includes(item.permission || '')
  );

  this.superItems = superAdminMenus.filter(item => 
    allowedRoutes.includes(item.permission || '')
  );
}

  loadBadges(): void {
    const sub = this.http.get<any>('/api/dashboard/stats').subscribe({
      next: (data) => {
        this.pendingTasks = data.pending_tasks || 0;
      },
      error: (err) => {
        console.error('Erro ao carregar badges', err);
      }
    });
    this.subscriptions.push(sub);
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  formatBadge(count: number): string {
    return count > 99 ? '99+' : count.toString();
  }

  toggleSidebar(): void {
    this.isOpen = !this.isOpen;
  }

  closeSidebar(): void {
    this.isOpen = false;
  }

  logout(): void {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
      const sub = this.authService.logout().subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          console.error('Erro ao fazer logout', err);
          this.router.navigate(['/auth/login']);
        }
      });
      this.subscriptions.push(sub);
    }
  }
}