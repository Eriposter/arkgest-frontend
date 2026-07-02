import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = '/api/documents';

  constructor(private http: HttpClient) {}

  getDocuments(projectId?: number): Observable<Document[]> {
    let params = new HttpParams();
    if (projectId) {
      params = params.set('project_id', projectId.toString());
    }
    
    return this.http.get<Document[]>(this.apiUrl, { params });
  }

  uploadDocument(formData: FormData): Observable<Document> {
    return this.http.post<Document>(this.apiUrl, formData);
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}