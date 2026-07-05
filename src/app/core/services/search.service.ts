import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

export interface SearchResult {
  id: number;
  title: string;
  subtitle: string;
  meta?: string;
  badge?: string;
  badge_color?: string;
  icon: string;
  color: string;
  url: string;
}

export interface SearchResponse {
  query: string;
  results: {
    projects: SearchResult[];
    clients: SearchResult[];
    tasks: SearchResult[];
    invoices: SearchResult[];
    meetings: SearchResult[];
    users: SearchResult[];
  };
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = '/api/search';
  private searchSubject = new Subject<string>();
  private searchResults$!: Observable<SearchResponse>;

  constructor(private http: HttpClient) {
    // ✅ Configurar debounce (300ms)
    this.searchResults$ = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.http.get<SearchResponse>(this.apiUrl, {
        params: new HttpParams().set('q', query)
      }))
    );
  }

  search(query: string): Observable<SearchResponse> {
    this.searchSubject.next(query);
    return this.searchResults$;
  }

  searchImmediate(query: string): Observable<SearchResponse> {
    return this.http.get<SearchResponse>(this.apiUrl, {
      params: new HttpParams().set('q', query)
    });
  }

  getCategoryLabel(category: string): string {
    const labels: any = {
      'projects': 'Projetos',
      'clients': 'Clientes',
      'tasks': 'Tarefas',
      'invoices': 'Faturas',
      'meetings': 'Reuniões',
      'users': 'Utilizadores'
    };
    return labels[category] || category;
  }

  getCategoryIcon(category: string): string {
    const icons: any = {
      'projects': 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z',
      'clients': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      'tasks': 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      'invoices': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'meetings': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      'users': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    };
    return icons[category] || '';
  }

  getCategoryColor(category: string): string {
    const colors: any = {
      'projects': 'from-indigo-500 to-purple-600',
      'clients': 'from-blue-500 to-cyan-600',
      'tasks': 'from-purple-500 to-pink-600',
      'invoices': 'from-emerald-500 to-green-600',
      'meetings': 'from-amber-500 to-orange-600',
      'users': 'from-pink-500 to-rose-600'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  }
}