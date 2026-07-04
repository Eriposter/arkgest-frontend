import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MeetingService } from '../../../core/services/meeting.service';

@Component({
  selector: 'app-meeting-modal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './meeting-modal.component.html'
})
export class MeetingModalComponent implements OnChanges {
  @Input() meeting: any = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  details: any = null;
  loading = false;

  constructor(public meetingService: MeetingService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['meeting'] && this.meeting) {
      this.loadDetails();
    }
  }

  loadDetails(): void {
    if (!this.meeting?.id) return;
    this.loading = true;
    this.meetingService.getMeetingDetails(this.meeting.id).subscribe({
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

  getRoleBadge(role: any): string {
    const badges: any = {
      'organizador': 'bg-purple-100 text-purple-700 border-purple-200',
      'apresentador': 'bg-blue-100 text-blue-700 border-blue-200',
      'participante': 'bg-gray-100 text-gray-700 border-gray-200',
      'convidado': 'bg-amber-100 text-amber-700 border-amber-200'
    };
    return badges[role] || 'bg-gray-100 text-gray-700';
  }

  getRoleLabel(role: any): string {
    const labels: any = {
      'organizador': 'Organizador',
      'apresentador': 'Apresentador',
      'participante': 'Participante',
      'convidado': 'Convidado'
    };
    return labels[role] || role;
  }

  getStatusIcon(status: any): string {
    const icons: any = {
      'accepted': 'check',
      'pending': 'clock',
      'declined': 'x'
    };
    return icons[status] || 'help';
  }

  getStatusColor(status: any): string {
    const colors: any = {
      'accepted': 'bg-emerald-100 text-emerald-600',
      'pending': 'bg-amber-100 text-amber-600',
      'declined': 'bg-red-100 text-red-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  }

  getStatusLabel(status: any): string {
    const labels: any = {
      'accepted': 'Confirmado',
      'pending': 'Pendente',
      'declined': 'Recusado'
    };
    return labels[status] || status;
  }

  getInitials(name: any): string {
    if (!name) return '?';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getTimelineIcon(icon: any): string {
    const icons: any = {
      'plus': 'M12 4v16m8-8H4',
      'check': 'M5 13l4 4L19 7',
      'flag': 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9'
    };
    return icons[icon] || icons['plus'];
  }

  getTimelineColor(type: any): string {
    const colors: any = {
      'created': 'bg-gray-100 text-gray-600',
      'confirmed': 'bg-emerald-100 text-emerald-600',
      'completed': 'bg-blue-100 text-blue-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  }

  formatDateTime(date: any): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}