import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/client.model';

@Component({
  selector: 'app-projeto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './projeto-form.component.html'
})
export class ProjetoFormComponent implements OnInit {
  form: FormGroup;
  clients: Client[] = [];
  projectType: 'residencial' | 'comercial' | 'industrial' | 'publico' | 'outro' = 'residencial';
  isEditing = false;
  projectId: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      // Principais
      name: ['', Validators.required],
      client_id: ['', Validators.required],
      
      // Tipo e fase
      type: ['residencial', Validators.required],
      phase: ['prospect', Validators.required],
      status: ['em_andamento', Validators.required],
      
      // Localização
      location: [''],
      area: [''],
      
      // Orçamento e datas
      budget: [''],
      start_date: [''],
      estimated_end_date: [''],
      actual_end_date: [''],
      
      // Progresso
      progress: [0],
      
      // Descrição
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadClients();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.projectId = +id;
      this.loadProject(this.projectId);
    }
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (data) => this.clients = data,
      error: (err) => console.error('Erro ao carregar clientes', err)
    });
  }

  loadProject(id: number): void {
    this.loading = true;
    this.projectService.getProject(id).subscribe({
      next: (project) => {
        this.form.patchValue({
          name: project.name,
          client_id: project.client_id,
          type: project.type,
          phase: project.phase,
          status: project.status,
          location: project.location || '',
          area: project.area || '',
          budget: project.budget || '',
          start_date: project.start_date ? this.formatDate(project.start_date) : '',
          estimated_end_date: project.estimated_end_date ? this.formatDate(project.estimated_end_date) : '',
          actual_end_date: project.actual_end_date ? this.formatDate(project.actual_end_date) : '',
          progress: project.progress || 0,
          description: project.description || ''
        });
        
        this.projectType = (project.type as 'residencial' | 'comercial' | 'industrial' | 'publico' | 'outro') || 'residencial';
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar projeto', err);
        this.loading = false;
        this.router.navigate(['/projetos']);
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

  selectType(type: 'residencial' | 'comercial' | 'industrial' | 'publico' | 'outro'): void {
    this.projectType = type;
    this.form.patchValue({ type });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const data = this.form.value;
    
    // Converter valores numéricos
    if (data.area) data.area = Number(data.area);
    if (data.budget) data.budget = Number(data.budget);
    if (data.progress) data.progress = Number(data.progress);

    const request$ = this.isEditing 
      ? this.projectService.updateProject(this.projectId!, data)
      : this.projectService.createProject(data);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/projetos']);
      },
      error: (err) => {
        console.error('Erro ao salvar', err);
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/projetos']);
  }

  getProgressColor(progress: number): string {
    if (progress < 30) return 'bg-red-500';
    if (progress < 60) return 'bg-amber-500';
    if (progress < 90) return 'bg-blue-500';
    return 'bg-emerald-500';
  }
}