import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meeting } from '../models/meeting.model';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private apiUrl = '/api/meetings';

  constructor(private http: HttpClient) {}

  getMeetings(filters?: any): Observable<Meeting[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<Meeting[]>(this.apiUrl, { params });
  }

  getTodayMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.apiUrl}/today`);
  }

  getUpcomingMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.apiUrl}/upcoming`);
  }

  getMeeting(id: number): Observable<Meeting> {
    return this.http.get<Meeting>(`${this.apiUrl}/${id}`);
  }

  createMeeting(data: Partial<Meeting>): Observable<Meeting> {
    return this.http.post<Meeting>(this.apiUrl, data);
  }

  updateMeeting(id: number, data: Partial<Meeting>): Observable<Meeting> {
    return this.http.put<Meeting>(`${this.apiUrl}/${id}`, data);
  }

  deleteMeeting(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}