import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';
import { ProjectService } from '../../../core/services/project.service';
import { ClientService } from '../../../core/services/client.service';
import { Project } from '../../../core/models/project.model';
import { Client } from '../../../core/models/client.model';

@Component({
  selector: 'app-fatura-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './fatura-form.component.html'
})
export class FaturaFormComponent implements OnInit {
  form: FormGroup;
  projects: Project[] = [];
  clients: Client[] = [];
  isEditing = false;
  invoiceId: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    public invoiceService: InvoiceService,
    private projectService: ProjectService,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      project_id: ['', Validators.required],
      client_id: ['', Validators.required],
      issue_date: ['', Validators.required],
      due_date: ['', Validators.required],
      items: this.fb.array([]),
      subtotal: [0, [Validators.required, Validators.min(0)]],
      tax_rate: [14, [Validators.min(0), Validators.max(100)]],
      status: ['draft', Validators.required],
      notes: ['']
    });
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadClients();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.invoiceId = +id;
      this.loadInvoice(this.invoiceId);
    } else {
      // Adicionar um item vazio por padrão
      this.addItem();
    }
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (data) => this.projects = data,
      error: (err) => console.error('Erro ao carregar projetos', err)
    });
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (data) => this.clients = data,
      error: (err) => console.error('Erro ao carregar clientes', err)
    });
  }

  loadInvoice(id: number): void {
    this.loading = true;
    this.invoiceService.getInvoice(id).subscribe({
      next: (inv) => {
        this.form.patchValue({
          project_id: inv.project_id,
          client_id: inv.client_id,
          issue_date: inv.issue_date ? this.formatDate(inv.issue_date) : '',
          due_date: inv.due_date ? this.formatDate(inv.due_date) : '',
          subtotal: inv.subtotal,
          tax_rate: inv.tax_rate,
          status: inv.status,
          notes: inv.notes || ''
        });
        
        // Carregar itens
        if (inv.items && inv.items.length > 0) {
          this.items.clear();
          inv.items.forEach(item => {
            this.items.push(this.fb.group({
              description: [item.description, Validators.required],
              quantity: [item.quantity, [Validators.required, Validators.min(1)]],
              unit_price: [item.unit_price, [Validators.required, Validators.min(0)]],
              total: [item.total, [Validators.required, Validators.min(0)]]
            }));
          });
        } else {
          this.addItem();
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar fatura', err);
        this.loading = false;
        this.router.navigate(['/faturas']);
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onProjectChange(projectId: number): void {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      this.form.patchValue({ client_id: project.client_id });
    }
  }

  addItem(): void {
    this.items.push(this.fb.group({
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit_price: [0, [Validators.required, Validators.min(0)]],
      total: [0, [Validators.required, Validators.min(0)]]
    }));
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
    this.recalculateItems();
  }

  recalculateItems(): void {
    let subtotal = 0;
    this.items.controls.forEach((group) => {
      const qty = Number(group.get('quantity')?.value || 0);
      const price = Number(group.get('unit_price')?.value || 0);
      const total = qty * price;
      group.get('total')?.setValue(total, { emitEvent: false });
      subtotal += total;
    });
    this.form.get('subtotal')?.setValue(subtotal);
  }

  get calculatedTotal(): number {
    const sub = Number(this.form.get('subtotal')?.value || 0);
    const tax = Number(this.form.get('tax_rate')?.value || 0);
    return sub + (sub * tax / 100);
  }

  get taxAmount(): number {
    const sub = Number(this.form.get('subtotal')?.value || 0);
    const tax = Number(this.form.get('tax_rate')?.value || 0);
    return (sub * tax / 100);
  }

  onSubmit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.loading = true;
  const data = { ...this.form.value };
  
  // ✅ Garantir que os valores numéricos estão corretos
  data.subtotal = Number(data.subtotal || 0);
  data.tax_rate = Number(data.tax_rate || 0);
  data.total = this.calculatedTotal; // ✅ Usar o valor calculado

  // Converter itens
  if (data.items) {
    data.items = data.items.map((item: any) => ({
      description: item.description,
      quantity: Number(item.quantity || 0),
      unit_price: Number(item.unit_price || 0),
      total: Number(item.quantity || 0) * Number(item.unit_price || 0),
    }));
  }

  // console.log('📤 Dados a enviar:', data);

  const request$ = this.isEditing 
    ? this.invoiceService.updateInvoice(this.invoiceId!, data)
    : this.invoiceService.createInvoice(data);

  request$.subscribe({
    next: (response) => {
      // console.log('✅ Fatura salva:', response);
      this.router.navigate(['/faturas']);
    },
    error: (err) => {
      console.error('❌ Erro ao salvar:', err);
      this.loading = false;
    }
  });
}

  cancel(): void {
    this.router.navigate(['/faturas']);
  }
}