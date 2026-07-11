import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { finalize, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

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
  error: string | null = null;
  selectedPeriod: string = 'month';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;
    
    this.dashboardService.getStats(this.selectedPeriod)
      .pipe(
        catchError((err) => {
          console.error('Erro ao carregar dashboard:', err);
          this.error = 'Erro ao carregar dados do dashboard. Tente novamente.';
          return throwError(() => err);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Resposta da API:', response);
          
          // Verifica se a resposta tem a estrutura esperada
          // Ajuste baseado na estrutura real da sua API
          const data = response.data || response;
          
          this.stats = {
            active_projects: data.active_projects ?? data.kpis?.projects_active ?? 0,
            pending_tasks: data.pending_tasks ?? data.kpis?.tasks_pending ?? 0,
            documents_count: data.documents_count ?? 0,
            meetings_today: data.meetings_today ?? data.upcoming_meetings?.length ?? 0,
            recent_projects: data.recent_projects ?? [],
            my_tasks: data.my_tasks ?? data.urgent_tasks ?? [],
            financial_summary: data.financial_summary || { 
              total_paid: 0, 
              total_pending: 0, 
              total_overdue: 0 
            }
          };
          
          console.log('Stats processados:', this.stats);
        },
        error: (err) => {
          console.error('Erro no subscribe:', err);
          // Se falhar, carrega dados mockados para teste
          this.loadMockData();
        }
      });
  }

  // Método para carregar dados mockados em caso de erro
  private loadMockData(): void {
    console.log('Carregando dados mockados para teste...');
    
    this.stats = {
      active_projects: 5,
      pending_tasks: 12,
      documents_count: 8,
      meetings_today: 3,
      recent_projects: [
        { 
          name: 'Projeto Alpha', 
          client: { name: 'Cliente A' }, 
          status: 'em_andamento', 
          phase: 'projeto_execucao' 
        },
        { 
          name: 'Projeto Beta', 
          client: { name: 'Cliente B' }, 
          status: 'em_andamento', 
          phase: 'obra' 
        },
        { 
          name: 'Projeto Gamma', 
          client: { name: 'Cliente C' }, 
          status: 'concluido', 
          phase: 'concluido' 
        }
      ],
      my_tasks: [
        { title: 'Revisar documentação', priority: 'alta', project: { name: 'Projeto Alpha' } },
        { title: 'Enviar orçamento', priority: 'media', project: { name: 'Projeto Beta' } },
        { title: 'Agendar reunião', priority: 'baixa', project: { name: 'Projeto Gamma' } }
      ],
      financial_summary: {
        total_paid: 450000,
        total_pending: 230000,
        total_overdue: 15000
      }
    };
    
    this.loading = false;
  }

  changePeriod(period: string): void {
    this.selectedPeriod = period;
    this.loadDashboard();
  }

  refreshDashboard(): void {
    this.loadDashboard();
  }

  getPhaseLabel(phase: string): string {
    const labels: any = {
      'prospect': 'Prospecção',
      'contratado': 'Contratado',
      'projeto_arquitetonico': 'Proj. Arquitetónico',
      'legalizacao': 'Legalização',
      'projeto_execucao': 'Proj. Execução',
      'obra': 'Obra',
      'concluido': 'Concluído'
    };
    return labels[phase] || phase || 'N/A';
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

  getPriorityBadge(priority: string): string {
    const colors: any = {
      'alta': 'bg-red-100 text-red-800',
      'media': 'bg-yellow-100 text-yellow-800',
      'baixa': 'bg-blue-100 text-blue-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  }

  formatCurrency(value: number): string {
    return this.dashboardService.formatCurrency(value);
  }

  formatNumber(value: number): string {
    return this.dashboardService.formatNumber(value);
  }
}