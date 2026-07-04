import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';
import { ProjectModalComponent } from '../project-modal/project-modal.component';


@Component({
  selector: 'app-projetos',
  standalone: true,
imports: [CommonModule, RouterModule, FormsModule, ProjectModalComponent],
  templateUrl: './projetos.component.html'
})
export class ProjetosComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  selectedProject: Project | null = null;
showModal = false;
  loading = true;
  
  // Stats
  stats = {
    total: 0,
    emAndamento: 0,
    concluidos: 0,
    pausados: 0,
    valorTotal: 0
  };

  // Filtros
  searchTerm = '';
  statusFilter = 'all';
  phaseFilter = 'all';
  typeFilter = 'all';
  itemsPerPage = 20;

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    
    this.projectService.getProjects().subscribe({
      next: (data) => {
        console.log('Projetos carregados:', data);
        this.projects = data;
        this.filteredProjects = data;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar projetos', err);
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.projects.length;
    this.stats.emAndamento = this.projects.filter(p => p.status === 'em_andamento').length;
    this.stats.concluidos = this.projects.filter(p => p.status === 'concluido').length;
    this.stats.pausados = this.projects.filter(p => p.status === 'pausado').length;
    this.stats.valorTotal = this.projects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
  }

  applyFilters(): void {
    let result = [...this.projects];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.client?.name?.toLowerCase().includes(term) ||
        p.code?.toLowerCase().includes(term)
      );
    }

    if (this.statusFilter !== 'all') {
      result = result.filter(p => p.status === this.statusFilter);
    }

    if (this.phaseFilter !== 'all') {
      result = result.filter(p => p.phase === this.phaseFilter);
    }

    if (this.typeFilter !== 'all') {
      result = result.filter(p => p.type === this.typeFilter);
    }

    this.filteredProjects = result;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.phaseFilter = 'all';
    this.typeFilter = 'all';
    this.filteredProjects = this.projects;
  }

  deleteProject(id: number): void {
    if (confirm('Tem a certeza que deseja eliminar este projeto?')) {
      this.projectService.deleteProject(id).subscribe({
        next: () => this.loadProjects(),
        error: (err) => console.error('Erro ao eliminar', err)
      });
    }
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

  getStatusLabel(status: string): string {
    const labels: any = {
      'em_andamento': 'Em Andamento',
      'pausado': 'Pausado',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado'
    };
    return labels[status] || status;
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

  getTypeLabel(type: string): string {
    const labels: any = {
      'residencial': 'Residencial',
      'comercial': 'Comercial',
      'industrial': 'Industrial',
      'publico': 'Público',
      'outro': 'Outro'
    };
    return labels[type] || type;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(value);
  }

  getProgressColor(progress: number): string {
    if (progress < 30) return 'bg-red-500';
    if (progress < 60) return 'bg-amber-500';
    if (progress < 90) return 'bg-blue-500';
    return 'bg-emerald-500';
  }

  openProjectDetails(project: Project): void {
  this.selectedProject = project;
  this.showModal = true;
}

closeModal(): void {
  this.showModal = false;
  this.selectedProject = null;
}

onProgressUpdated(updatedProject: Project): void {
  // Atualizar na lista
  const index = this.projects.findIndex(p => p.id === updatedProject.id);
  if (index !== -1) {
    this.projects[index] = updatedProject;
    this.filteredProjects[index] = updatedProject;
    if (this.selectedProject) {
      this.selectedProject = updatedProject;
    }
  }
}
}