import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SuperAdminService } from '../../../core/services/super-admin.service';

@Component({
  selector: 'app-tenants-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './tenants-list.component.html'
})
export class TenantsListComponent implements OnInit {
  tenants: any[] = [];
  filteredTenants: any[] = [];
  loading = true;
  searchTerm = '';
  statusFilter = 'all';
  planFilter = 'all';

  constructor(public superAdminService: SuperAdminService) {}

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.loading = true;
    this.superAdminService.getTenants().subscribe({
      next: (data) => {
        this.tenants = data;
        this.filteredTenants = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar tenants', err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let result = [...this.tenants];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(t =>
        t.name?.toLowerCase().includes(term) ||
        t.company_name?.toLowerCase().includes(term) ||
        t.email?.toLowerCase().includes(term)
      );
    }

    if (this.statusFilter !== 'all') {
      result = result.filter(t => t.status === this.statusFilter);
    }

    if (this.planFilter !== 'all') {
      result = result.filter(t => t.plan === this.planFilter);
    }

    this.filteredTenants = result;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.planFilter = 'all';
    this.filteredTenants = this.tenants;
  }

  toggleStatus(tenant: any): void {
    if (confirm(`Tem a certeza que deseja ${tenant.status === 'active' ? 'suspender' : 'ativar'} "${tenant.name}"?`)) {
      this.superAdminService.toggleTenantStatus(tenant.id).subscribe({
        next: () => this.loadTenants(),
        error: (err) => console.error('Erro ao alterar status', err)
      });
    }
  }

  deleteTenant(tenant: any): void {
    if (confirm(`ATENÇÃO: Eliminar "${tenant.name}" irá apagar TODOS os dados permanentemente. Continuar?`)) {
      this.superAdminService.deleteTenant(tenant.id).subscribe({
        next: () => this.loadTenants(),
        error: (err) => console.error('Erro ao eliminar', err)
      });
    }
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-PT');
  }

  getDaysRemaining(endDate: string): number | null {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }
}