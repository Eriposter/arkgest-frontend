import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MeetingService } from '../../../core/services/meeting.service';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  meetings: any[];
}

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './calendar-view.component.html'
})
export class CalendarViewComponent implements OnInit {
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  
  calendarDays: CalendarDay[] = [];
  allMeetings: any[] = [];
  loading = false;
  
  selectedMeeting: any = null;
  showModal = false;
  
  filterType = 'all';
  viewMode: 'month' | 'week' | 'list' = 'month';
  
  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  constructor(private meetingService: MeetingService) {}

  ngOnInit(): void {
    this.generateCalendar();
    this.loadMeetings();
  }

  generateCalendar(): void {
    this.calendarDays = [];
    
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Dias do mês anterior
    const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      this.calendarDays.push({
        date: new Date(this.currentYear, this.currentMonth - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        isToday: false,
        meetings: []
      });
    }
    
    // Dias do mês atual
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      date.setHours(0, 0, 0, 0);
      this.calendarDays.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        meetings: []
      });
    }
    
    // Dias do próximo mês (completar 42 células = 6 semanas)
    const remaining = 42 - this.calendarDays.length;
    for (let day = 1; day <= remaining; day++) {
      this.calendarDays.push({
        date: new Date(this.currentYear, this.currentMonth + 1, day),
        isCurrentMonth: false,
        isToday: false,
        meetings: []
      });
    }
  }

  loadMeetings(): void {
    this.loading = true;
    
    // Calcular range do calendário (incluindo dias do mês anterior/próximo)
    const startDate = this.calendarDays[0].date.toISOString().split('T')[0];
    const endDate = this.calendarDays[this.calendarDays.length - 1].date.toISOString().split('T')[0];
    
    const type = this.filterType !== 'all' ? this.filterType : undefined;
    
    this.meetingService.getMeetingsByPeriod(startDate, endDate, type).subscribe({
      next: (meetings) => {
        this.allMeetings = meetings;
        this.assignMeetingsToDays();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar reuniões', err);
        this.loading = false;
      }
    });
  }

  assignMeetingsToDays(): void {
    // Limpar reuniões dos dias
    this.calendarDays.forEach(day => day.meetings = []);
    
    // Atribuir reuniões aos dias
    this.allMeetings.forEach(meeting => {
      const meetingDate = new Date(meeting.start_time);
      meetingDate.setHours(0, 0, 0, 0);
      
      const day = this.calendarDays.find(d => 
        d.date.getTime() === meetingDate.getTime()
      );
      
      if (day) {
        day.meetings.push(meeting);
      }
    });
  }

  prevMonth(): void {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.generateCalendar();
    this.loadMeetings();
  }

  nextMonth(): void {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.generateCalendar();
    this.loadMeetings();
  }

  goToToday(): void {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.generateCalendar();
    this.loadMeetings();
  }

  changeFilter(type: string): void {
    this.filterType = type;
    this.loadMeetings();
  }

  openMeeting(meeting: any, event: Event): void {
    event.stopPropagation();
    this.selectedMeeting = meeting;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedMeeting = null;
  }

  getTypeColor(type: string): string {
    const colors: any = {
      'reuniao_cliente': 'bg-blue-500 hover:bg-blue-600',
      'visita_obra': 'bg-orange-500 hover:bg-orange-600',
      'reuniao_equipa': 'bg-purple-500 hover:bg-purple-600',
      'apresentacao': 'bg-emerald-500 hover:bg-emerald-600',
      'outro': 'bg-gray-500 hover:bg-gray-600'
    };
    return colors[type] || colors['outro'];
  }

  getTypeTextColor(type: string): string {
    const colors: any = {
      'reuniao_cliente': 'text-blue-600 bg-blue-50 border-blue-200',
      'visita_obra': 'text-orange-600 bg-orange-50 border-orange-200',
      'reuniao_equipa': 'text-purple-600 bg-purple-50 border-purple-200',
      'apresentacao': 'text-emerald-600 bg-emerald-50 border-emerald-200',
      'outro': 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[type] || colors['outro'];
  }

  getTypeLabel(type: string): string {
    return this.meetingService.getTypeLabel(type);
  }

  formatTime(dateTime: string): string {
    return new Date(dateTime).toLocaleTimeString('pt-PT', {
      hour: '2-digit', minute: '2-digit'
    });
  }

  getMeetingsByType(): any {
    const grouped: any = {};
    this.allMeetings.forEach(m => {
      if (!grouped[m.type]) grouped[m.type] = [];
      grouped[m.type].push(m);
    });
    return grouped;
  }

  getStats(): any {
    return {
      total: this.allMeetings.length,
      upcoming: this.allMeetings.filter(m => new Date(m.start_time) > new Date()).length,
      today: this.allMeetings.filter(m => {
        const d = new Date(m.start_time);
        const today = new Date();
        return d.toDateString() === today.toDateString();
      }).length,
      thisWeek: this.allMeetings.filter(m => {
        const d = new Date(m.start_time);
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return d >= weekStart && d <= weekEnd;
      }).length
    };
  }
}