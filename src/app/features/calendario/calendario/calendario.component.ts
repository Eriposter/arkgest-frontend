import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MeetingService } from '../../../core/services/meeting.service';
import { Meeting } from '../../../core/models/meeting.model';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './calendario.component.html'
})
export class CalendarioComponent implements OnInit {
  meetings: Meeting[] = [];
  filteredMeetings: Meeting[] = [];
  loading = true;
  
  // Stats
  stats = {
    total: 0,
    hoje: 0,
    agendadas: 0,
    concluidas: 0,
    estaSemana: 0
  };

  // Filtros
  searchTerm = '';
  typeFilter = 'all';
  statusFilter = 'all';
  dateFilter = 'all';

  constructor(private meetingService: MeetingService) {}

  ngOnInit(): void {
    this.loadMeetings();
  }

  loadMeetings(): void {
    this.loading = true;
    this.meetingService.getMeetings().subscribe({
      next: (data) => {
        this.meetings = data;
        this.filteredMeetings = data;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar reuniões', err);
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    this.stats.total = this.meetings.length;
    this.stats.hoje = this.meetings.filter(m => {
      const meetingDate = new Date(m.start_time);
      return meetingDate.toDateString() === today.toDateString();
    }).length;
    this.stats.agendadas = this.meetings.filter(m => m.status === 'agendada' || m.status === 'confirmada').length;
    this.stats.concluidas = this.meetings.filter(m => m.status === 'concluida').length;
    this.stats.estaSemana = this.meetings.filter(m => {
      const meetingDate = new Date(m.start_time);
      return meetingDate >= today && meetingDate <= endOfWeek;
    }).length;
  }

  applyFilters(): void {
    let result = [...this.meetings];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(m => 
        m.title.toLowerCase().includes(term) ||
        m.description?.toLowerCase().includes(term) ||
        m.project?.name?.toLowerCase().includes(term) ||
        m.location?.toLowerCase().includes(term)
      );
    }

    if (this.typeFilter !== 'all') {
      result = result.filter(m => m.type === this.typeFilter);
    }

    if (this.statusFilter !== 'all') {
      result = result.filter(m => m.status === this.statusFilter);
    }

    if (this.dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (this.dateFilter === 'today') {
        result = result.filter(m => new Date(m.start_time).toDateString() === today.toDateString());
      } else if (this.dateFilter === 'week') {
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + 7);
        result = result.filter(m => {
          const meetingDate = new Date(m.start_time);
          return meetingDate >= today && meetingDate <= endOfWeek;
        });
      } else if (this.dateFilter === 'month') {
        const endOfMonth = new Date(today);
        endOfMonth.setMonth(today.getMonth() + 1);
        result = result.filter(m => {
          const meetingDate = new Date(m.start_time);
          return meetingDate >= today && meetingDate <= endOfMonth;
        });
      }
    }

    this.filteredMeetings = result;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.typeFilter = 'all';
    this.statusFilter = 'all';
    this.dateFilter = 'all';
    this.filteredMeetings = this.meetings;
  }

  deleteMeeting(id: number): void {
    if (confirm('Tem a certeza que deseja eliminar esta reunião?')) {
      this.meetingService.deleteMeeting(id).subscribe({
        next: () => this.loadMeetings(),
        error: (err) => console.error('Erro ao eliminar', err)
      });
    }
  }

  getTypeBadge(type: string): string {
    const badges: any = {
      'reuniao_cliente': 'bg-blue-100 text-blue-700 border-blue-200',
      'visita_obra': 'bg-orange-100 text-orange-700 border-orange-200',
      'reuniao_equipa': 'bg-purple-100 text-purple-700 border-purple-200',
      'apresentacao': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'outro': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return badges[type] || 'bg-gray-100 text-gray-700';
  }

  getTypeLabel(type: string): string {
    const labels: any = {
      'reuniao_cliente': 'Reunião Cliente',
      'visita_obra': 'Visita Obra',
      'reuniao_equipa': 'Reunião Equipa',
      'apresentacao': 'Apresentação',
      'outro': 'Outro'
    };
    return labels[type] || type;
  }

  getStatusBadge(status: string): string {
    const badges: any = {
      'agendada': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'confirmada': 'bg-blue-100 text-blue-700 border-blue-200',
      'cancelada': 'bg-red-100 text-red-700 border-red-200',
      'concluida': 'bg-emerald-100 text-emerald-700 border-emerald-200'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'agendada': 'Agendada',
      'confirmada': 'Confirmada',
      'cancelada': 'Cancelada',
      'concluida': 'Concluída'
    };
    return labels[status] || status;
  }

  formatDateTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isToday(dateTime: string): boolean {
    const meetingDate = new Date(dateTime);
    const today = new Date();
    return meetingDate.toDateString() === today.toDateString();
  }

  isPast(dateTime: string): boolean {
    return new Date(dateTime) < new Date();
  }

  getMeetingDuration(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  }
}