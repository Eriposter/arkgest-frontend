import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-modal.component.html'
})
export class UserModalComponent implements OnChanges {
  @Input() user: any = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  details: any = null;
  loading = false;
  activeTab: 'overview' | 'projects' | 'tasks' | 'meetings' = 'overview';

  constructor(public userService: UserService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.loadDetails();
    }
  }

  loadDetails(): void {
    if (!this.user?.id) return;
    this.loading = true;
    this.userService.getUserDetails(this.user.id).subscribe({
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

  onClose(): void {
    this.close.emit();
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  getProjectStatusBadge(status: string): string {
    const badges: any = {
      'em_andamento': 'bg-emerald-100 text-emerald-700',
      'pausado': 'bg-amber-100 text-amber-700',
      'concluido': 'bg-blue-100 text-blue-700',
      'cancelado': 'bg-red-100 text-red-700'
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

  getMeetingTypeBadge(type: string): string {
    const badges: any = {
      'reuniao_cliente': 'bg-blue-100 text-blue-700',
      'visita_obra': 'bg-orange-100 text-orange-700',
      'reuniao_equipa': 'bg-purple-100 text-purple-700',
      'apresentacao': 'bg-emerald-100 text-emerald-700',
      'outro': 'bg-gray-100 text-gray-700'
    };
    return badges[type] || 'bg-gray-100 text-gray-700';
  }

  getMeetingStatusLabel(status: string): string {
    const labels: any = {
      'agendada': 'Agendada',
      'confirmada': 'Confirmada',
      'cancelada': 'Cancelada',
      'concluida': 'Concluída'
    };
    return labels[status] || status;
  }

  getMaxActivity(): number {
    if (!this.details?.activity_by_month) return 1;
    const max = Math.max(
      ...this.details.activity_by_month.map((m: any) => Math.max(m.projects, m.tasks))
    );
    return max || 1;
  }
}