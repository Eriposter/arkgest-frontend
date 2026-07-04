import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Project } from '../../../core/models/project.model';
import { ProjectService } from '../../../core/services/project.service';

@Component({
  selector: 'app-project-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './project-modal.component.html'
})
export class ProjectModalComponent implements OnInit, OnChanges {
  @Input() project: Project | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() progressUpdated = new EventEmitter<Project>();

  details: any = null;
  loading = false;
  updatingProgress = false;
  progressValue = 0;

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
  if (this.project) {
    this.progressValue = this.project.progress ?? 0; // ✅ Fallback para 0
  }
}

ngOnChanges(changes: SimpleChanges): void {
  if (changes['project'] && this.project) {
    this.progressValue = this.project.progress ?? 0; // ✅ Fallback para 0
    this.loadDetails();
  }
}

  loadDetails(): void {
    if (!this.project) return;
    
    this.loading = true;
    this.projectService.getProjectDetails(this.project.id).subscribe({
      next: (data) => {
        this.details = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes', err);
        this.loading = false;
      }
    });
  }

  onProgressChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.progressValue = value;
  }

  updateProgress(): void {
  if (!this.project || this.updatingProgress) return;

  this.updatingProgress = true;
  this.projectService.updateProgress(this.project.id, this.progressValue).subscribe({
    next: (response: any) => { // Use 'any' temporarily
      this.project = response.project;
      this.progressUpdated.emit(response.project);
      this.updatingProgress = false;
      this.loadDetails();
    },
    error: (err) => {
      console.error('Erro ao atualizar progresso', err);
      this.updatingProgress = false;
    }
  });
}

  onClose(): void {
    this.close.emit();
  }

  getProgressColor(progress: number): string {
    if (progress < 30) return 'from-red-500 to-red-600';
    if (progress < 60) return 'from-amber-500 to-orange-500';
    if (progress < 90) return 'from-blue-500 to-indigo-500';
    return 'from-emerald-500 to-green-500';
  }

  getProgressBg(progress: number): string {
    if (progress < 30) return 'bg-red-100 text-red-700';
    if (progress < 60) return 'bg-amber-100 text-amber-700';
    if (progress < 90) return 'bg-blue-100 text-blue-700';
    return 'bg-emerald-100 text-emerald-700';
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

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
}