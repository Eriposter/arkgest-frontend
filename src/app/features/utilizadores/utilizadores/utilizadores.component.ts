import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { UserModalComponent } from '../user-modal/user-modal.component';

@Component({
  selector: 'app-utilizadores',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, UserModalComponent],
  templateUrl: './utilizadores.component.html'
})
export class UtilizadoresComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;
  
  // Filtros
  searchTerm = '';
  roleFilter = 'all';
  statusFilter = 'all';
  
  // Stats
  stats = {
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0
  };
  
  // Modal
  selectedUser: any = null;
  showModal = false;

  constructor(private userService: UserService) {}

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
    this.stats.active = this.users.filter(u => u.is_active).length;
    this.stats.inactive = this.users.filter(u => !u.is_active).length;
    this.stats.admins = this.users.filter(u => u.role === 'admin').length;
  }

  applyFilters(): void {
    let result = [...this.users];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(u =>
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.phone?.toLowerCase().includes(term) ||
        u.position?.toLowerCase().includes(term)
      );
    }

    if (this.roleFilter !== 'all') {
      result = result.filter(u => u.role === this.roleFilter);
    }

    if (this.statusFilter !== 'all') {
      result = result.filter(u => 
        this.statusFilter === 'active' ? u.is_active : !u.is_active
      );
    }

    this.filteredUsers = result;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.roleFilter = 'all';
    this.statusFilter = 'all';
    this.filteredUsers = this.users;
  }

  openUserDetails(user: any): void {
    this.selectedUser = user;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedUser = null;
  }

  deleteUser(id: number): void {
    if (confirm('Tem a certeza que deseja eliminar este utilizador?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Erro ao eliminar', err)
      });
    }
  }

  getInitials(name?: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getRoleBadge(role?: string): string {
    return this.userService.getRoleBadge(role);
  }

  getRoleLabel(role?: string): string {
    return this.userService.getRoleLabel(role);
  }

  formatDate(date?: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }
}