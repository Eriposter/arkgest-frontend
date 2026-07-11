import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SuperAdminService } from '../../../core/services/super-admin.service';

@Component({
  selector: 'app-tenant-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tenant-details.component.html'
})
export class TenantDetailsComponent implements OnInit {
  tenantId!: number;
  tenant: any = null;
  stats: any = null;
  users: any[] = [];
  licenses: any[] = [];
  loading = true;
  activeTab = 'overview';
  editing = false;
  editForm: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public superAdminService: SuperAdminService
  ) {}

  ngOnInit(): void {
    this.tenantId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTenant();
  }

  loadTenant(): void {
    this.loading = true;
    this.superAdminService.getTenant(this.tenantId).subscribe({
      next: (data) => {
        this.tenant = data.tenant;
        this.stats = data.stats;
        this.users = data.users;
        this.licenses = data.licenses;
        this.editForm = { ...this.tenant };
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar tenant', err);
        this.loading = false;
      }
    });
  }

  startEditing(): void {
    this.editForm = { ...this.tenant };
    this.editing = true;
  }

  cancelEditing(): void {
    this.editing = false;
    this.editForm = { ...this.tenant };
  }

  saveChanges(): void {
    this.superAdminService.updateTenant(this.tenantId, this.editForm).subscribe({
      next: () => {
        this.tenant = { ...this.tenant, ...this.editForm };
        this.editing = false;
        alert('✅ Alterações guardadas!');
      },
      error: (err) => {
        console.error('Erro ao atualizar', err);
        alert('❌ Erro ao guardar alterações');
      }
    });
  }

  toggleStatus(): void {
    const action = this.tenant.status === 'active' ? 'suspender' : 'ativar';
    if (confirm(`Tem a certeza que deseja ${action} "${this.tenant.name}"?`)) {
      this.superAdminService.toggleTenantStatus(this.tenantId).subscribe({
        next: (response) => {
          this.tenant.status = response.status;
          alert(`✅ Tenant ${response.status}`);
        },
        error: (err) => console.error('Erro', err)
      });
    }
  }

  deleteTenant(): void {
    if (confirm(`⚠️ ATENÇÃO: Eliminar "${this.tenant.name}" irá apagar TODOS os dados permanentemente. Continuar?`)) {
      const confirm2 = confirm('Esta ação é IRREVERSÍVEL. Tem ABSOLUTAMENTE a certeza?');
      if (confirm2) {
        this.superAdminService.deleteTenant(this.tenantId).subscribe({
          next: () => {
            alert('✅ Tenant eliminado');
            this.router.navigate(['/super-admin/tenants']);
          },
          error: (err) => console.error('Erro', err)
        });
      }
    }
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  getDaysRemaining(endDate: string): number | null {
    return this.superAdminService.getDaysRemaining(endDate);
  }
}