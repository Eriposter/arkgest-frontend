import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SuperAdminService } from '../../../core/services/super-admin.service';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './super-admin-dashboard.component.html'
})
export class SuperAdminDashboardComponent implements OnInit {
  stats: any = null;
  loading = true;

  constructor(private superAdminService: SuperAdminService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.superAdminService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar estatísticas', err);
        this.loading = false;
      }
    });
  }

  getPlanBadge(plan: string): string {
    const badges: any = {
      'basic': 'bg-blue-100 text-blue-700',
      'professional': 'bg-purple-100 text-purple-700',
      'enterprise': 'bg-amber-100 text-amber-700'
    };
    return badges[plan] || 'bg-gray-100 text-gray-700';
  }
}