import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/client.model';
import { ClientModalComponent } from '../client-modal/client-modal.component';


@Component({
  selector: 'app-clientes',
  standalone: true,
imports: [CommonModule, RouterModule, FormsModule, ClientModalComponent],
  templateUrl: './clientes.component.html'
})
export class ClientesComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  loading = true;
  selectedClient: Client | null = null;
showModal = false;
  
  // Stats
  stats = {
    total: 0,
    ativos: 0,
    pessoaFisica: 0,
    potenciais: 0
  };

  // Filtros
  searchTerm = '';
  statusFilter = 'all';
  typeFilter = 'all';
  itemsPerPage = 20;

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    const params: any = {};
    if (this.statusFilter !== 'all') params.status = this.statusFilter;
    if (this.typeFilter !== 'all') params.type = this.typeFilter;
    if (this.searchTerm) params.search = this.searchTerm;

    this.clientService.getClients(params).subscribe({
      next: (data) => {
        console.log('Clientes carregados:', data); // Debug
        this.clients = data;
        this.filteredClients = data;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar clientes', err);
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.clients.length;
    this.stats.ativos = this.clients.filter(c => c.status === 'active').length;
    this.stats.pessoaFisica = this.clients.filter(c => c.client_type === 'fisica' || !c.company).length;
    this.stats.potenciais = this.clients.filter(c => c.status === 'prospect').length;
  }

  applyFilters(): void {
    this.loadClients();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.typeFilter = 'all';
    this.loadClients();
  }

  deleteClient(id: number): void {
    if (confirm('Tem a certeza que deseja eliminar este cliente?')) {
      this.clientService.deleteClient(id).subscribe({
        next: () => this.loadClients(),
        error: (err) => console.error('Erro ao eliminar', err)
      });
    }
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
    return client.client_type === 'fisica' || !client.company ? 'PF' : 'PJ';
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  openClientDetails(client: Client): void {
  this.selectedClient = client;
  this.showModal = true;
}

closeModal(): void {
  this.showModal = false;
  this.selectedClient = null;
}
}