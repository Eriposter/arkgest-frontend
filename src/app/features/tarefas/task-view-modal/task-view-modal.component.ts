import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-view-modal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './task-view-modal.component.html'
})
export class TaskViewModalComponent implements OnInit, OnChanges {
  @Input() task: Task | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<Task>();

  taskDetails: Task | null = null;
  loading = false;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      this.loadTaskDetails();
    }
  }

  loadTaskDetails(): void {
    if (!this.task) return;
    this.loading = true;
    this.taskService.getTask(this.task.id).subscribe({
      next: (data) => {
        this.taskDetails = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar tarefa', err);
        this.loading = false;
      }
    });
  }

  toggleSubtask(subtaskId: number): void {
    if (!this.taskDetails) return;
    
    this.taskService.toggleSubtask(this.taskDetails.id, subtaskId).subscribe({
        next: (response) => {
            this.taskDetails = {
                ...this.taskDetails!, // Use non-null assertion
                progress: response.task_progress,
                subtasks: this.taskDetails!.subtasks?.map(s => 
                    s.id === subtaskId ? { ...s, is_completed: !s.is_completed } : s
                )
            };
            this.taskUpdated.emit(this.taskDetails);
        },
        error: (err) => console.error('Erro ao toggle subtarefa', err)
    });
}

  onClose(): void {
    this.close.emit();
  }

  getProgressColor(progress: number): string {
    if (progress < 30) return 'bg-red-500';
    if (progress < 60) return 'bg-amber-500';
    if (progress < 90) return 'bg-blue-500';
    return 'bg-emerald-500';
  }

  getPriorityBadge(priority: string): string {
    const badges: any = {
      'baixa': 'bg-blue-100 text-blue-700',
      'media': 'bg-yellow-100 text-yellow-700',
      'alta': 'bg-orange-100 text-orange-700',
      'urgente': 'bg-red-100 text-red-700'
    };
    return badges[priority] || 'bg-gray-100 text-gray-700';
  }

  getStatusBadge(status: string): string {
    const badges: any = {
      'pendente': 'bg-gray-100 text-gray-700',
      'em_progresso': 'bg-blue-100 text-blue-700',
      'revisao': 'bg-purple-100 text-purple-700',
      'concluida': 'bg-emerald-100 text-emerald-700',
      'cancelada': 'bg-red-100 text-red-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  }

  getRoleBadge(role: string): string {
    const badges: any = {
      'colaborador': 'bg-blue-100 text-blue-700',
      'revisor': 'bg-purple-100 text-purple-700',
      'observador': 'bg-gray-100 text-gray-700'
    };
    return badges[role] || 'bg-gray-100 text-gray-700';
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }
}