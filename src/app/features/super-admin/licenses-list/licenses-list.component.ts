import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SuperAdminService } from '../../../core/services/super-admin.service';

@Component({
  selector: 'app-licenses-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './licenses-list.component.html'
})
export class LicensesListComponent implements OnInit {
  licenses: any[] = [];
  tenants: any[] = [];
  stats: any = {};
  loading = true;
  
  // Filtros
  search = '';
  statusFilter = '';
  typeFilter = '';
  planFilter = '';
  tenantFilter = '';

  // Modais
  showCreateModal = false;
  showDetailsModal = false;
  showUpgradeModal = false;
  showRenewModal = false;
  
  selectedLicense: any = null;
  
  // Formulários
  newLicense: any = {};
  upgradeData: any = {};
  renewData: any = { duration_days: 30 };

  plans = [
    { value: 'basic', label: 'Básico', users: 5, projects: 10, storage: 1000, price: 15000 },
    { value: 'professional', label: 'Profissional', users: 20, projects: 50, storage: 5000, price: 35000 },
    { value: 'enterprise', label: 'Empresarial', users: 100, projects: 500, storage: 50000, price: 75000 }
  ];

  constructor(public sa: SuperAdminService) {}

  ngOnInit(): void {
    this.loadLicenses();
    this.loadTenants();
  }

  loadLicenses(): void {
    this.loading = true;
    const filters: any = {};
    if (this.search) filters.search = this.search;
    if (this.statusFilter) filters.status = this.statusFilter;
    if (this.typeFilter) filters.type = this.typeFilter;
    if (this.planFilter) filters.plan = this.planFilter;
    if (this.tenantFilter) filters.tenant_id = this.tenantFilter;

    this.sa.getLicenses(filters).subscribe({
      next: (data) => {
        this.licenses = data.licenses;
        this.stats = data.stats;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro', err);
        this.loading = false;
      }
    });
  }

  loadTenants(): void {
    this.sa.getTenants().subscribe({
      next: (data) => this.tenants = data,
      error: (err) => console.error('Erro', err)
    });
  }

  applyFilters(): void {
    this.loadLicenses();
  }

  clearFilters(): void {
    this.search = '';
    this.statusFilter = '';
    this.typeFilter = '';
    this.planFilter = '';
    this.tenantFilter = '';
    this.loadLicenses();
  }

  // ============================================
  // CRIAR LICENÇA
  // ============================================
  openCreateModal(): void {
    this.newLicense = {
      tenant_id: null,
      type: 'monthly',
      plan: 'basic',
      max_users: 5,
      max_projects: 10,
      max_storage_mb: 1000,
      price: 15000,
      currency: 'AOA',
      duration_days: 30,
      notes: '',
      force_create: false
    };
    this.showCreateModal = true;
  }

  onPlanChange(): void {
    const plan = this.plans.find(p => p.value === this.newLicense.plan);
    if (plan) {
      this.newLicense.max_users = plan.users;
      this.newLicense.max_projects = plan.projects;
      this.newLicense.max_storage_mb = plan.storage;
      this.newLicense.price = plan.price;
    }
  }

  createLicense(): void {
    if (!this.newLicense.tenant_id) {
      alert('Selecione uma empresa');
      return;
    }

    this.sa.createLicense(this.newLicense).subscribe({
      next: (response) => {
        alert('✅ ' + response.message);
        this.showCreateModal = false;
        this.loadLicenses();
      },
      error: (err) => {
        if (err.status === 409) {
          // Licença já existe - perguntar se é upgrade
          if (confirm(`${err.error.message}\n\nDeseja substituir a licença atual (upgrade)?`)) {
            this.newLicense.force_create = true;
            this.createLicense();
          }
        } else {
          alert('❌ Erro: ' + (err.error?.message || 'Erro desconhecido'));
        }
      }
    });
  }

  // ============================================
  // VER DETALHES
  // ============================================
  viewDetails(license: any): void {
    this.sa.getLicense(license.id).subscribe({
      next: (data) => {
        this.selectedLicense = data.license;
        this.showDetailsModal = true;
      },
      error: (err) => console.error('Erro', err)
    });
  }

  // ============================================
  // TOGGLE STATUS (Suspender/Ativar)
  // ============================================
  toggleStatus(license: any): void {
    const action = license.status === 'active' ? 'suspender' : 'ativar';
    if (confirm(`Tem a certeza que deseja ${action} a licença ${license.license_key}?`)) {
      this.sa.toggleLicenseStatus(license.id).subscribe({
        next: (response) => {
          alert('✅ ' + response.message);
          this.loadLicenses();
        },
        error: (err) => alert('❌ Erro: ' + (err.error?.message || 'Erro'))
      });
    }
  }

  // ============================================
  // RENOVER
  // ============================================
  openRenewModal(license: any): void {
    this.selectedLicense = license;
    this.renewData = { 
      duration_days: license.type === 'yearly' ? 365 : 30 
    };
    this.showRenewModal = true;
  }

  renewLicense(): void {
    this.sa.renewLicense(this.selectedLicense.id, this.renewData.duration_days).subscribe({
      next: (response) => {
        alert('✅ ' + response.message);
        this.showRenewModal = false;
        this.loadLicenses();
      },
      error: (err) => alert('❌ Erro: ' + (err.error?.message || 'Erro'))
    });
  }

  // ============================================
  // UPGRADE
  // ============================================
  openUpgradeModal(license: any): void {
    this.selectedLicense = license;
    this.upgradeData = {
      new_plan: license.plan,
      new_type: license.type,
      new_price: license.price,
      duration_days: license.type === 'yearly' ? 365 : 30,
      notes: `Upgrade de ${license.plan}`
    };
    this.showUpgradeModal = true;
  }

  onUpgradePlanChange(): void {
    const plan = this.plans.find(p => p.value === this.upgradeData.new_plan);
    if (plan) {
      this.upgradeData.new_price = plan.price;
    }
  }

  upgradeLicense(): void {
    if (!confirm(`Confirmar upgrade da licença ${this.selectedLicense.license_key}?`)) return;
    
    this.sa.upgradeLicense(this.selectedLicense.id, this.upgradeData).subscribe({
      next: (response) => {
        alert('✅ ' + response.message);
        this.showUpgradeModal = false;
        this.loadLicenses();
      },
      error: (err) => alert('❌ Erro: ' + (err.error?.message || 'Erro'))
    });
  }

  // ============================================
  // ELIMINAR
  // ============================================
  deleteLicense(license: any): void {
    if (!confirm(`⚠️ ATENÇÃO: Eliminar a licença ${license.license_key}?\n\nEsta ação não pode ser desfeita.`)) return;
    if (!confirm('Tem ABSOLUTAMENTE a certeza?')) return;

    this.sa.deleteLicense(license.id).subscribe({
      next: (response) => {
        alert('✅ ' + response.message);
        this.loadLicenses();
      },
      error: (err) => alert('❌ Erro: ' + (err.error?.message || 'Erro'))
    });
  }

  // ============================================
  // HELPERS
  // ============================================
  formatDate(date: string): string {
    return this.sa.formatDate(date);
  }

  getDaysRemaining(license: any): number | null {
    if (!license.expires_at) return null;
    return this.sa.getDaysRemaining(license.expires_at);
  }
}