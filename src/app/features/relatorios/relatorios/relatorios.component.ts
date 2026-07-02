import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './relatorios.component.html'
})
export class RelatoriosComponent implements OnInit {
  loading = true;
  
  // Dados brutos
  rawData: any = {};

  // Chart: Projetos por Fase (Doughnut)
  projectsByPhaseData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }]
  };
  projectsByPhaseOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  // Chart: Projetos por Tipo (Bar)
  projectsByTypeData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: '#6366f1' }]
  };
  projectsByTypeOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  // Chart: Faturamento Mensal (Line)
  monthlyRevenueData: ChartData<'line'> = {
    labels: [],
    datasets: [
      { label: 'Pago', data: [], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4 },
      { label: 'Pendente', data: [], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4 },
      { label: 'Atrasado', data: [], borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.4 }
    ]
  };
  monthlyRevenueOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      y: { beginAtZero: true }
    }
  };

  // Chart: Tarefas por Status (Doughnut)
  tasksByStatusData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }]
  };
  tasksByStatusOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  };

  // Chart: Tarefas por Prioridade (Bar)
  tasksByPriorityData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }]
  };
  tasksByPriorityOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  // Chart: Top Clientes (Bar Horizontal)
  topClientsData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: '#8b5cf6' }]
  };
  topClientsOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    scales: {
      x: { beginAtZero: true }
    }
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.http.get('/api/reports/dashboard').subscribe({
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
    // Projetos por Fase
    const phaseLabels: any = {
      'prospect': 'Prospecção', 'contratado': 'Contratado',
      'projeto_arquitetonico': 'Proj. Arquitetónico', 'legalizacao': 'Legalização',
      'projeto_execucao': 'Proj. Execução', 'obra': 'Obra', 'concluido': 'Concluído'
    };
    const phaseColors = ['#9ca3af', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#f59e0b', '#10b981'];
    this.projectsByPhaseData = {
      labels: data.projects_by_phase.map((p: any) => phaseLabels[p.phase] || p.phase),
      datasets: [{ data: data.projects_by_phase.map((p: any) => p.total), backgroundColor: phaseColors }]
    };

    // Projetos por Tipo
    const typeLabels: any = {
      'residencial': 'Residencial', 'comercial': 'Comercial',
      'industrial': 'Industrial', 'publico': 'Público', 'outro': 'Outro'
    };
    this.projectsByTypeData = {
      labels: data.projects_by_type.map((p: any) => typeLabels[p.type] || p.type),
      datasets: [{ data: data.projects_by_type.map((p: any) => p.total), backgroundColor: '#6366f1' }]
    };

    // Faturamento Mensal
    this.monthlyRevenueData = {
      labels: data.monthly_revenue.map((m: any) => m.month),
      datasets: [
        { label: 'Pago', data: data.monthly_revenue.map((m: any) => Number(m.paid)), borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4 },
        { label: 'Pendente', data: data.monthly_revenue.map((m: any) => Number(m.pending)), borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4 },
        { label: 'Atrasado', data: data.monthly_revenue.map((m: any) => Number(m.overdue)), borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.4 }
      ]
    };

    // Tarefas por Status
    const statusLabels: any = {
      'pendente': 'Pendente', 'em_progresso': 'Em Progresso',
      'revisao': 'Revisão', 'concluida': 'Concluída', 'cancelada': 'Cancelada'
    };
    const statusColors = ['#9ca3af', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];
    this.tasksByStatusData = {
      labels: data.tasks_by_status.map((t: any) => statusLabels[t.status] || t.status),
      datasets: [{ data: data.tasks_by_status.map((t: any) => t.total), backgroundColor: statusColors }]
    };

    // Tarefas por Prioridade
    const priorityLabels: any = { 'baixa': 'Baixa', 'media': 'Média', 'alta': 'Alta', 'urgente': 'Urgente' };
    const priorityColors = ['#3b82f6', '#eab308', '#f97316', '#ef4444'];
    this.tasksByPriorityData = {
      labels: data.tasks_by_priority.map((t: any) => priorityLabels[t.priority] || t.priority),
      datasets: [{ data: data.tasks_by_priority.map((t: any) => t.total), backgroundColor: priorityColors }]
    };

    // Top Clientes
    this.topClientsData = {
      labels: data.top_clients.map((c: any) => c.name),
      datasets: [{ data: data.top_clients.map((c: any) => Number(c.total_billed)), backgroundColor: '#8b5cf6' }]
    };
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(value);
  }
}