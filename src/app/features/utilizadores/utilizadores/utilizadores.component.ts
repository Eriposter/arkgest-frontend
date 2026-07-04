import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-utilizadores',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './utilizadores.component.html'
})
export class UtilizadoresComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;
  currentUser: any;
  
  stats = {
    total: 0,
    ativos: 0,
    inativos: 0,
    admins: 0
  };

  searchTerm = '';
  roleFilter = 'all';

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.getUser();
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar utilizadores', err);
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.users.length;
    this.stats.ativos = this.users.filter(u => u.is_active).length;
    this.stats.inativos = this.users.filter(u => !u.is_active).length;
    this.stats.admins = this.users.filter(u => u.role === 'admin').length;
  }

  applyFilters(): void {
    let result = [...this.users];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.position?.toLowerCase().includes(term)
      );
    }

    if (this.roleFilter !== 'all') {
      result = result.filter(u => u.role === this.roleFilter);
    }

    this.filteredUsers = result;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.roleFilter = 'all';
    this.filteredUsers = this.users;
  }

  deleteUser(id: number): void {
    if (id === this.currentUser?.id) {
      alert('Não pode eliminar o seu próprio utilizador');
      return;
    }

    if (confirm('Tem a certeza que deseja eliminar este utilizador?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Erro ao eliminar', err)
      });
    }
  }

  getRoleBadge(role: string): string {
    const badges: any = {
      'admin': 'bg-purple-100 text-purple-700 border-purple-200',
      'gestor': 'bg-blue-100 text-blue-700 border-blue-200',
      'arquiteto': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'estagiario': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return badges[role] || 'bg-gray-100 text-gray-700';
  }

  getRoleLabel(role: string): string {
    const labels: any = {
      'admin': 'Administrador',
      'gestor': 'Gestor',
      'arquiteto': 'Arquiteto',
      'estagiario': 'Estagiário'
    };
    return labels[role] || role;
  }
}