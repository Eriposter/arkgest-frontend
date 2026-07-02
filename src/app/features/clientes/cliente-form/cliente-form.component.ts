import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cliente-form.component.html'
})
export class ClienteFormComponent implements OnInit {
  form: FormGroup;
  clientType: 'fisica' | 'empresa' | 'estado' | 'ong' | 'cooperativa' = 'fisica';
  isEditing = false;
  clientId: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      // Principais
      name: ['', Validators.required],
      sobrenome: [''],
      company: [''],
      
      // Contactos
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      
      // Documentos
      nif: [''],
      bi: [''],
      passport: [''],
      profession: [''],
      birthday: [''],
      
      // Localização
      address: [''],
      city: [''],
      country: ['Angola'],
      
      // Configurações
      status: ['active'],
      client_type: ['fisica'],
      
      // Extras
      notes: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.clientId = +id;
      this.loadClient(this.clientId);
    }
  }

  loadClient(id: number): void {
    this.loading = true;
    this.clientService.getClient(id).subscribe({
      next: (client) => {
        this.form.patchValue({
          name: client.name,
          sobrenome: '',
          company: client.company || '',
          email: client.email,
          phone: client.phone || '',
          nif: client.nif || '',
          bi: client.bi || '',
          passport: client.passport || '',
          profession: client.profession || '',
          birthday: client.birthday ? this.formatDate(client.birthday) : '',
          address: client.address || '',
          city: client.city || '',
          country: client.country || 'Angola',
          status: client.status || 'active',
          client_type: client.client_type || 'fisica',
          notes: client.notes || ''
        });
        
        this.clientType = client.client_type || 'fisica';
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar cliente', err);
        this.loading = false;
        this.router.navigate(['/clientes']);
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

  selectType(type: 'fisica' | 'empresa' | 'estado' | 'ong' | 'cooperativa'): void {
    this.clientType = type;
    this.form.patchValue({ 
      client_type: type,
      company: type === 'fisica' ? '' : this.form.get('company')?.value
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      console.log('Formulário inválido', this.form.errors);
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formData = this.form.value;
    
    // Preparar dados para envio
    const data = {
      ...formData,
      client_type: this.clientType,
      company: this.clientType === 'fisica' ? null : formData.company
    };

    // Remover campos vazios
    Object.keys(data).forEach(key => {
      if (data[key] === '' || data[key] === null) {
        delete data[key];
      }
    });

    const request$ = this.isEditing 
      ? this.clientService.updateClient(this.clientId!, data)
      : this.clientService.createClient(data);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/clientes']);
      },
      error: (err) => {
        console.error('Erro ao salvar', err);
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/clientes']);
  }
}