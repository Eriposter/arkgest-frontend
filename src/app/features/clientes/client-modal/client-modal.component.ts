import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { Client, ClientDetails } from '../../../core/models/client.model';

@Component({
  selector: 'app-client-modal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-modal.component.html'
})
export class ClientModalComponent implements OnInit, OnChanges {
  @Input() client: Client | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  
  details: ClientDetails | null = null; // Properly typed
  loading = false;
  

  constructor(public clientService: ClientService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['client'] && this.client) {
      this.loadDetails();
    }
  }

  loadDetails(): void {
    if (!this.client) return;
    this.loading = true;
    this.clientService.getClientDetails(this.client.id).subscribe({
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

  getStatusBadge(status: string): string {
    const badges: any = {
      'active': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'inactive': 'bg-gray-100 text-gray-700 border-gray-200',
      'prospect': 'bg-amber-100 text-amber-700 border-amber-200'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'active': 'Ativo',
      'inactive': 'Inativo',
      'prospect': 'Potencial'
    };
    return labels[status] || status;
  }

  getTypeLabel(client: Client): string {
    const labels: any = {
        'fisica': 'Pessoa Física',
        'empresa': 'Empresa',
        'estado': 'Estado',
        'ong': 'ONG',
        'cooperativa': 'Cooperativa'
    };
    return labels[client.client_type ?? 'fisica'] || 'Pessoa Física';
}

  getInitials(name: string): string {
    if (!name) return 'C';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  formatDate(date: string): string {
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

  getInvoiceStatusBadge(status: string): string {
    const badges: any = {
      'draft': 'bg-gray-100 text-gray-700',
      'sent': 'bg-blue-100 text-blue-700',
      'paid': 'bg-emerald-100 text-emerald-700',
      'overdue': 'bg-red-100 text-red-700',
      'cancelled': 'bg-gray-100 text-gray-500'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  }
}