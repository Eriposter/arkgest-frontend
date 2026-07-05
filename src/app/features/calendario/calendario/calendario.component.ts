import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MeetingService } from '../../../core/services/meeting.service';
import { CalendarViewComponent } from '../calendar-view/calendar-view.component';
import { MeetingModalComponent } from '../meeting-modal/meeting-modal.component';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CalendarViewComponent, MeetingModalComponent],
  templateUrl: './calendario.component.html'
})
export class CalendarioComponent implements OnInit {
  meetings: any[] = [];
  filteredMeetings: any[] = [];
  loading = true;
  
  // ✅ Tabs: 'calendar' ou 'list'
  activeView: 'calendar' | 'list' = 'calendar';
  
  // Filtros
  searchTerm = '';
  statusFilter = 'all';
  typeFilter = 'all';
  
  // Stats
  stats = {
    total: 0,
    agendadas: 0,
    confirmadas: 0,
    concluidas: 0
  };
  
  // Modal
  selectedMeeting: any = null;
  showModal = false;

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
    this.stats.total = this.meetings.length;
    this.stats.agendadas = this.meetings.filter(m => m.status === 'agendada').length;
    this.stats.confirmadas = this.meetings.filter(m => m.status === 'confirmada').length;
    this.stats.concluidas = this.meetings.filter(m => m.status === 'concluida').length;
  }

  applyFilters(): void {
    let result = [...this.meetings];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(m =>
        m.title?.toLowerCase().includes(term) ||
        m.location?.toLowerCase().includes(term) ||
        m.project?.name?.toLowerCase().includes(term)
      );
    }

    if (this.statusFilter !== 'all') {
      result = result.filter(m => m.status === this.statusFilter);
    }

    if (this.typeFilter !== 'all') {
      result = result.filter(m => m.type === this.typeFilter);
    }

    this.filteredMeetings = result;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.typeFilter = 'all';
    this.filteredMeetings = this.meetings;
  }

  openMeetingDetails(meeting: any): void {
    this.selectedMeeting = meeting;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedMeeting = null;
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
    return this.meetingService.getTypeColor(type);
  }

  getTypeLabel(type: string): string {
    return this.meetingService.getTypeLabel(type);
  }

  getStatusBadge(status: string): string {
    return this.meetingService.getStatusBadge(status);
  }

  getStatusLabel(status: string): string {
    return this.meetingService.getStatusLabel(status);
  }

  formatDateTime(dateTime: string): string {
    return this.meetingService.formatDateTime(dateTime);
  }

  formatTime(dateTime: string): string {
    return this.meetingService.formatTime(dateTime);
  }

  formatDate(dateTime: string): string {
    return this.meetingService.formatDate(dateTime);
  }
}