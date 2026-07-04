import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { TaskService } from '../../../core/services/task.service';
import { DocumentService } from '../../../core/services/document.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Project } from '../../../core/models/project.model';
import { Task } from '../../../core/models/task.model';
import { Document } from '../../../core/models/document.model';
import { Invoice } from '../../../core/models/invoice.model';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './project-details.component.html'
})
export class ProjectDetailsComponent implements OnInit {
  project: Project | null = null;
  details: any = null;
  loading = true;
  projectId: number = 0;

  // Tabs
  activeTab: 'overview' | 'tasks' | 'documents' | 'invoices' | 'timeline' = 'overview';

  // Dados das tabs
  tasks: Task[] = [];
  documents: Document[] = [];
  invoices: Invoice[] = [];
  timeline: any[] = [];

  // Filtros de tarefas
  taskFilter: 'all' | 'pending' | 'progress' | 'done' = 'all';

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private taskService: TaskService,
    private documentService: DocumentService,
    public invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading = true;

    // Carregar detalhes do projeto
    this.projectService.getProjectDetails(this.projectId).subscribe({
      next: (data) => {
        this.project = data.project;
        this.details = data.stats;
        this.timeline = data.recent_activities || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar projeto', err);
        this.loading = false;
      }
    });

    // Carregar tarefas do projeto
    this.taskService.getTasks({ project_id: this.projectId }).subscribe({
      next: (data) => this.tasks = data,
      error: (err) => console.error('Erro ao carregar tarefas', err)
    });

    // Carregar documentos do projeto
    this.documentService.getDocuments(this.projectId).subscribe({
      next: (data) => this.documents = data,
      error: (err) => console.error('Erro ao carregar documentos', err)
    });

    // Carregar faturas do projeto
    this.invoiceService.getInvoices().subscribe({
      next: (data) => {
        this.invoices = data.filter(inv => inv.project_id === this.projectId);
      },
      error: (err) => console.error('Erro ao carregar faturas', err)
    });
  }

  get filteredTasks(): Task[] {
    if (this.taskFilter === 'all') return this.tasks;
    if (this.taskFilter === 'pending') return this.tasks.filter(t => t.status === 'pendente');
    if (this.taskFilter === 'progress') return this.tasks.filter(t => t.status === 'em_progresso');
    if (this.taskFilter === 'done') return this.tasks.filter(t => t.status === 'concluida');
    return this.tasks;
  }

  getProgressColor(progress: number): string {
    if (progress < 30) return 'bg-red-500';
    if (progress < 60) return 'bg-amber-500';
    if (progress < 90) return 'bg-blue-500';
    return 'bg-emerald-500';
  }

  getStatusBadge(status: string): string {
    const badges: any = {
      'em_andamento': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'pausado': 'bg-amber-100 text-amber-700 border-amber-200',
      'concluido': 'bg-blue-100 text-blue-700 border-blue-200',
      'cancelado': 'bg-red-100 text-red-700 border-red-200'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  }

  getTaskStatusBadge(status: string): string {
    const badges: any = {
      'pendente': 'bg-gray-100 text-gray-700',
      'em_progresso': 'bg-blue-100 text-blue-700',
      'revisao': 'bg-purple-100 text-purple-700',
      'concluida': 'bg-emerald-100 text-emerald-700',
      'cancelada': 'bg-red-100 text-red-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  }

  getTaskPriorityBadge(priority: string): string {
    const badges: any = {
      'baixa': 'bg-blue-100 text-blue-700',
      'media': 'bg-yellow-100 text-yellow-700',
      'alta': 'bg-orange-100 text-orange-700',
      'urgente': 'bg-red-100 text-red-700'
    };
    return badges[priority] || 'bg-gray-100 text-gray-700';
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
    return labels[phase] || phase;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(value || 0);
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(mimeType: string): string {
    if (mimeType?.includes('pdf')) return 'pdf';
    if (mimeType?.includes('image')) return 'image';
    if (mimeType?.includes('word') || mimeType?.includes('document')) return 'word';
    if (mimeType?.includes('excel') || mimeType?.includes('sheet')) return 'excel';
    return 'file';
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
  // Adicione estes métodos no final da classe ProjectDetailsComponent

getPendingTasksCount(): number {
  return this.tasks.filter(t => t.status === 'pendente').length;
}

getInProgressTasksCount(): number {
  return this.tasks.filter(t => t.status === 'em_progresso').length;
}

getDoneTasksCount(): number {
  return this.tasks.filter(t => t.status === 'concluida').length;
}
}