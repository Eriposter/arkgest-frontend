import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';

@Component({
  selector: 'app-invoice-modal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './invoice-modal.component.html'
})
export class InvoiceModalComponent implements OnChanges {
  @Input() invoice: any = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() invoiceUpdated = new EventEmitter<any>();

  details: any = null;
  loading = false;

  constructor(public invoiceService: InvoiceService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invoice'] && this.invoice) {
      this.loadDetails();
    }
  }

  loadDetails(): void {
    if (!this.invoice?.id) return;
    this.loading = true;
    this.invoiceService.getInvoiceDetails(this.invoice.id).subscribe({
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

  getStatusBadge(status: any): string {
    if (!status) return 'bg-gray-100 text-gray-700 border-gray-200';
    const badges: any = {
      'draft': 'bg-gray-100 text-gray-700 border-gray-200',
      'sent': 'bg-blue-100 text-blue-700 border-blue-200',
      'paid': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'overdue': 'bg-red-100 text-red-700 border-red-200',
      'cancelled': 'bg-gray-100 text-gray-500 border-gray-200'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  }

  getStatusLabel(status: any): string {
    if (!status) return '';
    const labels: any = {
      'draft': 'Rascunho',
      'sent': 'Enviada',
      'paid': 'Paga',
      'overdue': 'Atrasada',
      'cancelled': 'Cancelada'
    };
    return labels[status] || status;
  }

  getStatusIcon(status: any): string {
    const icons: any = {
      'created': 'plus',
      'sent': 'send',
      'paid': 'check',
      'overdue': 'warning'
    };
    return icons[status] || 'info';
  }

  getStatusColor(type: any): string {
    const colors: any = {
      'created': 'bg-gray-100 text-gray-600',
      'sent': 'bg-blue-100 text-blue-600',
      'paid': 'bg-emerald-100 text-emerald-600',
      'overdue': 'bg-red-100 text-red-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  }

  formatDate(date: any): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  formatDateTime(date: any): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  getDaysUntilDue(days: any): string {
  if (days === null || days === undefined) return '-';
  
  const daysNum = Math.round(Number(days)); // ✅ Garantir inteiro
  
  if (daysNum < 0) return `Atrasada ${Math.abs(daysNum)} dias`;
  if (daysNum === 0) return 'Vence hoje';
  if (daysNum === 1) return 'Vence amanhã';
  return `Vence em ${daysNum} dias`;
}

getDaysClass(days: any): string {
  if (days === null || days === undefined) return 'text-white';
  
  const daysNum = Math.round(Number(days));
  
  if (daysNum < 0) return 'text-red-300'; // Atrasada
  if (daysNum <= 7) return 'text-amber-300'; // Próximo do vencimento
  return 'text-emerald-300'; // Ainda tem tempo
}


}