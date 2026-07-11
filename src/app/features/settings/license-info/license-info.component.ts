import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-license-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './license-info.component.html'
})
export class LicenseInfoComponent implements OnInit {
  license: any = null;
  tenant: any = null;
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadLicense();
  }

  loadLicense(): void {
    this.loading = true;
    this.http.get<any>('/api/license/current').subscribe({
      next: (data) => {
        this.license = data.license;
        this.tenant = data.tenant;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar licença', err);
        this.loading = false;
      }
    });
  }

  getPlanLabel(plan: string): string {
    const labels: any = {
      'basic': 'Básico',
      'professional': 'Profissional',
      'enterprise': 'Empresarial'
    };
    return labels[plan] || plan;
  }

  getPlanColor(plan: string): string {
    const colors: any = {
      'basic': 'from-blue-500 to-cyan-500',
      'professional': 'from-purple-500 to-pink-500',
      'enterprise': 'from-amber-500 to-orange-500'
    };
    return colors[plan] || 'from-gray-500 to-gray-600';
  }

  getTypeLabel(type: string): string {
    const labels: any = {
      'trial': 'Período de Teste',
      'monthly': 'Mensal',
      'yearly': 'Anual',
      'lifetime': 'Vitalício'
    };
    return labels[type] || type;
  }

  getUsagePercent(current: number, max: number): number {
    if (!max || max === 0) return 0;
    return Math.min(100, Math.round((current / max) * 100));
  }

  getUsageColor(percent: number): string {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  }
}