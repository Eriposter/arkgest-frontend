import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface DashboardStats {
  active_projects: number;
  pending_tasks: number;
  documents_count: number;
  meetings_today: number;
  recent_projects: any[];
  my_tasks: any[];
  financial_summary: {
    total_paid: number;
    total_pending: number;
    total_overdue: number;
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    active_projects: 0,
    pending_tasks: 0,
    documents_count: 0,
    meetings_today: 0,
    recent_projects: [],
    my_tasks: [],
    financial_summary: { total_paid: 0, total_pending: 0, total_overdue: 0 }
  };
  
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.http.get<DashboardStats>('/api/dashboard/stats').subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dashboard', err);
        this.loading = false;
      }
    });
  }

  // Helpers para o HTML
  getPhaseLabel(phase: string): string {
    const labels: any = {
      'prospect': 'Prospecção', 'contratado': 'Contratado',
      'projeto_arquitetonico': 'Proj. Arquitetónico', 'legalizacao': 'Legalização',
      'projeto_execucao': 'Proj. Execução', 'obra': 'Obra', 'concluido': 'Concluído'
    };
    return labels[phase] || phase;
  }

  getStatusBadge(status: string): string {
    const colors: any = {
      'em_andamento': 'bg-green-100 text-green-800',
      'pausado': 'bg-yellow-100 text-yellow-800',
      'concluido': 'bg-blue-100 text-blue-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(value);
  }
}