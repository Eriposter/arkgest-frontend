import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meeting } from '../models/meeting.model';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private apiUrl = '/api/meetings';

  constructor(private http: HttpClient) {}

  getMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(this.apiUrl);
  }

  getMeeting(id: number): Observable<Meeting> {
    return this.http.get<Meeting>(`${this.apiUrl}/${id}`);
  }

  getMeetingDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/details`);
  }

  createMeeting(data: any): Observable<Meeting> {
    return this.http.post<Meeting>(this.apiUrl, data);
  }

  updateMeeting(id: number, data: any): Observable<Meeting> {
    return this.http.put<Meeting>(`${this.apiUrl}/${id}`, data);
  }

  deleteMeeting(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getTypeLabel(type: string): string {
    const labels: any = {
      'reuniao_cliente': 'Reunião com Cliente',
      'visita_obra': 'Visita à Obra',
      'reuniao_equipa': 'Reunião de Equipa',
      'apresentacao': 'Apresentação',
      'outro': 'Outro'
    };
    return labels[type] || type;
  }

  getTypeColor(type: string): string {
    const colors: any = {
      'reuniao_cliente': 'bg-blue-100 text-blue-700 border-blue-200',
      'visita_obra': 'bg-orange-100 text-orange-700 border-orange-200',
      'reuniao_equipa': 'bg-purple-100 text-purple-700 border-purple-200',
      'apresentacao': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'outro': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  }

  getStatusBadge(status: string): string {
    const badges: any = {
      'agendada': 'bg-blue-100 text-blue-700 border-blue-200',
      'confirmada': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'cancelada': 'bg-red-100 text-red-700 border-red-200',
      'concluida': 'bg-gray-100 text-gray-700 border-gray-200'
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

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('pt-PT', {
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }
}