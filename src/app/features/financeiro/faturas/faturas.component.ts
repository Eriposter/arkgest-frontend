import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Invoice } from '../../../core/models/invoice.model';

@Component({
  selector: 'app-faturas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './faturas.component.html'
})
export class FaturasComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  loading = true;
  
  // Stats
  stats = {
    total: 0,
    pagas: 0,
    pendentes: 0,
    atrasadas: 0,
    valorTotal: 0,
    valorPago: 0,
    valorPendente: 0,
    valorAtrasado: 0
  };

  // Filtros
  searchTerm = '';
  statusFilter = 'all';
  clientFilter = 'all';

  constructor(public invoiceService: InvoiceService) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading = true;
    this.invoiceService.getInvoices().subscribe({
      next: (data) => {
        this.invoices = data;
        this.filteredInvoices = data;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar faturas', err);
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.invoices.length;
    this.stats.pagas = this.invoices.filter(i => i.status === 'paid').length;
    this.stats.pendentes = this.invoices.filter(i => i.status === 'sent' || i.status === 'draft').length;
    this.stats.atrasadas = this.invoices.filter(i => i.status === 'overdue').length;
    
    this.stats.valorTotal = this.invoices.reduce((acc, i) => acc + Number(i.total || 0), 0);
    this.stats.valorPago = this.invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + Number(i.total || 0), 0);
    this.stats.valorPendente = this.invoices.filter(i => i.status === 'sent' || i.status === 'draft').reduce((acc, i) => acc + Number(i.total || 0), 0);
    this.stats.valorAtrasado = this.invoices.filter(i => i.status === 'overdue').reduce((acc, i) => acc + Number(i.total || 0), 0);
  }

  applyFilters(): void {
    let result = [...this.invoices];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(i => 
        i.invoice_number?.toLowerCase().includes(term) ||
        i.client?.name?.toLowerCase().includes(term) ||
        i.project?.name?.toLowerCase().includes(term)
      );
    }

    if (this.statusFilter !== 'all') {
      result = result.filter(i => i.status === this.statusFilter);
    }

    this.filteredInvoices = result;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.filteredInvoices = this.invoices;
  }

  markAsPaid(id: number): void {
    if (confirm('Confirmar pagamento desta fatura?')) {
      this.invoiceService.markAsPaid(id).subscribe({
        next: () => this.loadInvoices(),
        error: (err) => console.error('Erro ao marcar como paga', err)
      });
    }
  }

  deleteInvoice(id: number): void {
    if (confirm('Tem a certeza que deseja eliminar esta fatura?')) {
      this.invoiceService.deleteInvoice(id).subscribe({
        next: () => this.loadInvoices(),
        error: (err) => console.error('Erro ao eliminar', err)
      });
    }
  }

  getStatusBadge(status: string): string {
    const badges: any = {
      'draft': 'bg-gray-100 text-gray-700 border-gray-200',
      'sent': 'bg-blue-100 text-blue-700 border-blue-200',
      'paid': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'overdue': 'bg-red-100 text-red-700 border-red-200',
      'cancelled': 'bg-gray-100 text-gray-500 border-gray-200'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'draft': 'Rascunho',
      'sent': 'Enviada',
      'paid': 'Paga',
      'overdue': 'Atrasada',
      'cancelled': 'Cancelada'
    };
    return labels[status] || status;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}