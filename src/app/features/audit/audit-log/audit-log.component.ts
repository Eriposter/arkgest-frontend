import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../../core/services/audit.service';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-log.component.html'
})
export class AuditLogComponent implements OnInit {
  activities: any[] = [];
  stats: any = {};
  loading = true;
  
  // Filtros
  filterEvent = 'all';
  filterType = 'all';
  filterDateFrom = '';
  filterDateTo = '';

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading = true;
    const params: any = {};
    if (this.filterEvent !== 'all') params.event = this.filterEvent;
    if (this.filterType !== 'all') params.subject_type = this.filterType;
    if (this.filterDateFrom) params.date_from = this.filterDateFrom;
    if (this.filterDateTo) params.date_to = this.filterDateTo;

    this.auditService.getAuditLogs(params).subscribe({
      next: (data) => {
        this.activities = data.activities;
        this.stats = data.stats;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar logs', err);
        this.loading = false;
      }
    });
  }

  clearFilters(): void {
    this.filterEvent = 'all';
    this.filterType = 'all';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.loadLogs();
  }

  getEventLabel(event: string): string {
    return this.auditService.getEventLabel(event);
  }

  getEventColor(event: string): string {
    return this.auditService.getEventColor(event);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  getChangesSummary(properties: any): string {
    if (!properties?.attributes) return '';
    const keys = Object.keys(properties.attributes);
    if (keys.length === 0) return '';
    return keys.slice(0, 3).join(', ') + (keys.length > 3 ? '...' : '');
  }
}