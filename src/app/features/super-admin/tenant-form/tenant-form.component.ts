import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SuperAdminService } from '../../../core/services/super-admin.service';

@Component({
  selector: 'app-tenant-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tenant-form.component.html'
})
export class TenantFormComponent implements OnInit {
  loading = false;
  isEditMode = false;
  tenantId: number | null = null;
  createdTenant: any = null;
  adminPassword = '';
  adminEmail = '';

  formData = {
    name: '',
    slug: '',
    company_name: '',
    nif: '',
    email: '',
    phone: '',
    address: '',
    plan: 'basic',
    trial_days: 30,
    admin_name: 'Administrador', // ✅ Nome do admin
    admin_password: '', // ✅ Password custom (opcional)
    // Campos extras para edição
    status: 'trial',
    max_users: 5,
    max_projects: 10,
    max_storage_mb: 1000,
    subscription_starts_at: '',
    subscription_ends_at: '',
    trial_ends_at: '',
    auto_renew: false,
  };

  plans = [
    { value: 'basic', label: 'Básico', price: '15.000', users: 5, projects: 10, storage: '1 GB', color: 'blue' },
    { value: 'professional', label: 'Profissional', price: '35.000', users: 20, projects: 50, storage: '5 GB', color: 'purple', popular: true },
    { value: 'enterprise', label: 'Empresarial', price: '75.000', users: 100, projects: 500, storage: '50 GB', color: 'amber' }
  ];

  statuses = [
    { value: 'active', label: 'Ativo', color: 'emerald' },
    { value: 'trial', label: 'Trial', color: 'blue' },
    { value: 'suspended', label: 'Suspenso', color: 'red' },
    { value: 'cancelled', label: 'Cancelado', color: 'gray' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private superAdminService: SuperAdminService
  ) {}

  ngOnInit(): void {
    // ✅ Verificar se é modo edição
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.tenantId = Number(id);
      this.loadTenant();
    }
  }

  loadTenant(): void {
    if (!this.tenantId) return;
    
    this.loading = true;
    this.superAdminService.getTenant(this.tenantId).subscribe({
      next: (data) => {
        const t = data.tenant;
        this.formData = {
          name: t.name || '',
          slug: t.slug || '',
          company_name: t.company_name || '',
          nif: t.nif || '',
          email: t.email || '',
          phone: t.phone || '',
          address: t.address || '',
          plan: t.plan || 'basic',
          trial_days: 30,
          admin_name: '', // Não mostrar ao editar
          admin_password: '',
          status: t.status || 'trial',
          max_users: t.max_users || 5,
          max_projects: t.max_projects || 10,
          max_storage_mb: t.max_storage_mb || 1000,
          subscription_starts_at: t.subscription_starts_at || '',
          subscription_ends_at: t.subscription_ends_at || '',
          trial_ends_at: t.trial_ends_at || '',
          auto_renew: t.auto_renew || false,
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar tenant', err);
        alert('Erro ao carregar empresa');
        this.router.navigate(['/super-admin/tenants']);
      }
    });
  }

  onNameChange(): void {
    if (this.formData.name && !this.isEditMode) {
      this.formData.slug = this.formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      if (!this.formData.company_name) {
        this.formData.company_name = this.formData.name;
      }
    }
  }

  selectPlan(plan: string): void {
    this.formData.plan = plan;
    const planData = this.plans.find(p => p.value === plan);
    if (planData && !this.isEditMode) {
      this.formData.max_users = planData.users;
      this.formData.max_projects = planData.projects;
    }
  }

  generateRandomPassword(): void {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.formData.admin_password = password;
  }

  onSubmit(): void {
    if (!this.formData.name || !this.formData.slug || !this.formData.email) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.tenantId) {
      // ✅ MODO EDIÇÃO
      this.superAdminService.updateTenant(this.tenantId, this.formData).subscribe({
        next: () => {
          this.loading = false;
          alert('✅ Empresa atualizada com sucesso!');
          this.router.navigate(['/super-admin/tenants']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Erro', err);
          alert('❌ Erro ao atualizar: ' + (err.error?.message || 'Erro desconhecido'));
        }
      });
    } else {
      // ✅ MODO CRIAÇÃO
      this.superAdminService.createTenant(this.formData).subscribe({
        next: (response) => {
          this.createdTenant = response.tenant;
          this.adminPassword = response.admin_password;
          this.adminEmail = response.admin_email;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          console.error('Erro', err);
          const errorMsg = err.error?.errors 
            ? Object.values(err.error.errors).flat().join(', ')
            : (err.error?.message || 'Erro desconhecido');
          alert('❌ Erro ao criar: ' + errorMsg);
        }
      });
    }
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }
}