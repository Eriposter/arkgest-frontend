import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './relatorios.component.html'
})
export class RelatoriosComponent implements OnInit {
  loading = true;
  rawData: any = {};
  
  // Filtros
  filters = {
    period: '6m',
    date_from: '',
    date_to: '',
    project_type: '',
    project_status: '',
    client_id: ''
  };

  // Tab ativa
  activeTab: 'financeiro' | 'projetos' | 'tarefas' | 'clientes' = 'financeiro';

  // Charts
  monthlyRevenueData: ChartData<'line'> = { labels: [], datasets: [] };
monthlyRevenueOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${this.formatCurrency(ctx.parsed.y ?? 0)}`
        }
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v) => this.formatCurrencyShort(Number(v)) } }
    }
  };

  projectsByPhaseData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  projectsByPhaseOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } }
    }
  };

  projectsByTypeData: ChartData<'bar'> = { labels: [], datasets: [] };
  projectsByTypeOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  tasksByStatusData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  tasksByStatusOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } }
    }
  };

  tasksByPriorityData: ChartData<'bar'> = { labels: [], datasets: [] };
  tasksByPriorityOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  topClientsData: ChartData<'bar'> = { labels: [], datasets: [] };
topClientsOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed.x;
            return value !== null ? this.formatCurrency(value) : '0';
          }
        }
      }
    },
    scales: {
      x: { 
        beginAtZero: true,
        ticks: { 
          callback: (v) => {
            const value = Number(v);
            return !isNaN(value) ? this.formatCurrencyShort(value) : '';
          }
        }
      }
    }
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadReports();
  }

  setDefaultDates(): void {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    this.filters.date_to = now.toISOString().split('T')[0];
    this.filters.date_from = sixMonthsAgo.toISOString().split('T')[0];
  }

  onPeriodChange(period: string): void {
    this.filters.period = period;
    const now = new Date();
    const from = new Date();
    
    switch(period) {
      case '7d': from.setDate(now.getDate() - 7); break;
      case '30d': from.setDate(now.getDate() - 30); break;
      case '3m': from.setMonth(now.getMonth() - 3); break;
      case '6m': from.setMonth(now.getMonth() - 6); break;
      case '1y': from.setFullYear(now.getFullYear() - 1); break;
      case 'custom': return;
    }
    
    this.filters.date_from = from.toISOString().split('T')[0];
    this.filters.date_to = now.toISOString().split('T')[0];
    this.loadReports();
  }

  applyFilters(): void {
    this.loadReports();
  }

  clearFilters(): void {
    this.filters.project_type = '';
    this.filters.project_status = '';
    this.filters.client_id = '';
    this.onPeriodChange('6m');
  }

  loadReports(): void {
    this.loading = true;
    const params: any = {
      date_from: this.filters.date_from,
      date_to: this.filters.date_to
    };
    if (this.filters.project_type) params.project_type = this.filters.project_type;
    if (this.filters.project_status) params.project_status = this.filters.project_status;
    if (this.filters.client_id) params.client_id = this.filters.client_id;

    this.http.get('/api/reports/dashboard', { params }).subscribe({
      next: (data: any) => {
        this.rawData = data;
        this.processData(data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar relatórios', err);
        this.loading = false;
      }
    });
  }

  processData(data: any): void {
    const phaseLabels: any = {
      'prospect': 'Prospecção', 'contratado': 'Contratado',
      'projeto_arquitetonico': 'Proj. Arquitetónico', 'legalizacao': 'Legalização',
      'projeto_execucao': 'Proj. Execução', 'obra': 'Obra', 'concluido': 'Concluído'
    };
    const phaseColors = ['#9ca3af', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#f59e0b', '#10b981'];
    this.projectsByPhaseData = {
      labels: data.projects_by_phase.map((p: any) => phaseLabels[p.phase] || p.phase),
      datasets: [{ data: data.projects_by_phase.map((p: any) => p.total), backgroundColor: phaseColors, borderWidth: 0 }]
    };

    const typeLabels: any = {
      'residencial': 'Residencial', 'comercial': 'Comercial',
      'industrial': 'Industrial', 'publico': 'Público', 'outro': 'Outro'
    };
    this.projectsByTypeData = {
      labels: data.projects_by_type.map((p: any) => typeLabels[p.type] || p.type),
      datasets: [{ data: data.projects_by_type.map((p: any) => p.total), backgroundColor: '#6366f1', borderRadius: 8 }]
    };

    this.monthlyRevenueData = {
      labels: data.monthly_revenue.map((m: any) => m.month),
      datasets: [
        { label: 'Pago', data: data.monthly_revenue.map((m: any) => Number(m.paid)), borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6 },
        { label: 'Pendente', data: data.monthly_revenue.map((m: any) => Number(m.pending)), borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6 },
        { label: 'Atrasado', data: data.monthly_revenue.map((m: any) => Number(m.overdue)), borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6 }
      ]
    };

    const statusLabels: any = {
      'pendente': 'Pendente', 'em_progresso': 'Em Progresso',
      'revisao': 'Revisão', 'concluida': 'Concluída', 'cancelada': 'Cancelada'
    };
    const statusColors = ['#9ca3af', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];
    this.tasksByStatusData = {
      labels: data.tasks_by_status.map((t: any) => statusLabels[t.status] || t.status),
      datasets: [{ data: data.tasks_by_status.map((t: any) => t.total), backgroundColor: statusColors, borderWidth: 0 }]
    };

    const priorityLabels: any = { 'baixa': 'Baixa', 'media': 'Média', 'alta': 'Alta', 'urgente': 'Urgente' };
    const priorityColors = ['#3b82f6', '#eab308', '#f97316', '#ef4444'];
    this.tasksByPriorityData = {
      labels: data.tasks_by_priority.map((t: any) => priorityLabels[t.priority] || t.priority),
      datasets: [{ data: data.tasks_by_priority.map((t: any) => t.total), backgroundColor: priorityColors, borderRadius: 8 }]
    };

    this.topClientsData = {
      labels: data.top_clients.map((c: any) => c.name),
      datasets: [{ data: data.top_clients.map((c: any) => Number(c.total_billed)), backgroundColor: '#8b5cf6', borderRadius: 8 }]
    };
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(value);
  }

  formatCurrencyShort(value: number): string {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
    return value.toString();
  }

  getChangeClass(value: number): string {
    if (value > 0) return 'text-emerald-600 bg-emerald-50';
    if (value < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  }

  getChangeIcon(value: number): string {
    if (value > 0) return '↑';
    if (value < 0) return '↓';
    return '→';
  }

  exportData(): void {
    const dataStr = JSON.stringify(this.rawData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorios_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  }
}