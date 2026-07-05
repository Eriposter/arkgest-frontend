import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { TaskViewModalComponent } from '../task-view-modal/task-view-modal.component';


@Component({
  selector: 'app-tarefas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TaskViewModalComponent],
  templateUrl: './tarefas.component.html'
})
export class TarefasComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  loading = true;
  currentUser: User | null = null;
  activeTab: 'all' | 'my' | 'unassigned' = 'all';
  selectedTask: Task | null = null;
showViewModal = false;
  
  // Stats
  stats = {
    total: 0,
    pendentes: 0,
    emProgresso: 0,
    concluidas: 0,
    atrasadas: 0
  };

  // Filtros
  searchTerm = '';
  statusFilter = 'all';
  priorityFilter = 'all';
  projectFilter = 'all';
  assigneeFilter = 'all';

  constructor(
    private taskService: TaskService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    
    const request$ = this.activeTab === 'my' 
      ? this.taskService.getMyTasks()
      : this.taskService.getTasks();
    
    request$.subscribe({
      next: (data) => {
        // console.log('Tarefas carregadas:', data);
        this.tasks = data;
        this.filteredTasks = data;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar tarefas', err);
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.tasks.length;
    this.stats.pendentes = this.tasks.filter(t => t.status === 'pendente').length;
    this.stats.emProgresso = this.tasks.filter(t => t.status === 'em_progresso').length;
    this.stats.concluidas = this.tasks.filter(t => t.status === 'concluida').length;
    this.stats.atrasadas = this.tasks.filter(t => this.isOverdue(t)).length;
  }

  applyFilters(): void {
    let result = [...this.tasks];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term) ||
        t.project?.name?.toLowerCase().includes(term)
      );
    }

    if (this.statusFilter !== 'all') {
      result = result.filter(t => t.status === this.statusFilter);
    }

    if (this.priorityFilter !== 'all') {
      result = result.filter(t => t.priority === this.priorityFilter);
    }

    if (this.projectFilter !== 'all') {
      result = result.filter(t => t.project_id === Number(this.projectFilter));
    }

    if (this.assigneeFilter === 'unassigned') {
      result = result.filter(t => !t.assigned_to);
    } else if (this.assigneeFilter === 'me') {
      result = result.filter(t => t.assigned_to === this.currentUser?.id);
    }

    this.filteredTasks = result;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.priorityFilter = 'all';
    this.projectFilter = 'all';
    this.assigneeFilter = 'all';
    this.filteredTasks = this.tasks;
  }

  switchTab(tab: 'all' | 'my' | 'unassigned'): void {
    this.activeTab = tab;
    this.loadTasks();
  }

  deleteTask(id: number): void {
    if (confirm('Tem a certeza que deseja eliminar esta tarefa?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => this.loadTasks(),
        error: (err) => console.error('Erro ao eliminar', err)
      });
    }
  }

  getPriorityBadge(priority: string): string {
    const badges: any = {
      'baixa': 'bg-blue-100 text-blue-700 border-blue-200',
      'media': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'alta': 'bg-orange-100 text-orange-700 border-orange-200',
      'urgente': 'bg-red-100 text-red-700 border-red-200'
    };
    return badges[priority] || 'bg-gray-100 text-gray-700';
  }

  getStatusBadge(status: string): string {
    const badges: any = {
      'pendente': 'bg-gray-100 text-gray-700 border-gray-200',
      'em_progresso': 'bg-blue-100 text-blue-700 border-blue-200',
      'revisao': 'bg-purple-100 text-purple-700 border-purple-200',
      'concluida': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'cancelada': 'bg-red-100 text-red-700 border-red-200'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'pendente': 'Pendente',
      'em_progresso': 'Em Progresso',
      'revisao': 'Revisão',
      'concluida': 'Concluída',
      'cancelada': 'Cancelada'
    };
    return labels[status] || status;
  }

  isOverdue(task: Task): boolean {
    if (!task.due_date) return false;
    if (task.status === 'concluida' || task.status === 'cancelada') return false;
    return new Date(task.due_date) < new Date();
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  openTaskView(task: Task): void {
  this.selectedTask = task;
  this.showViewModal = true;
}

closeViewModal(): void {
  this.showViewModal = false;
  this.selectedTask = null;
}
}