import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Project } from '../../../core/models/project.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-tarefa-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './tarefa-form.component.html'
})
export class TarefaFormComponent implements OnInit {
  form: FormGroup;
  projects: Project[] = [];
  users: User[] = [];
  selectedAssignee: User | null = null;
  isEditing = false;
  taskId: number | null = null;
  loading = false;
  currentUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private projectService: ProjectService,
    private authService: AuthService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.currentUser = this.authService.getUser();
    
    this.form = this.fb.group({
      project_id: ['', Validators.required],
      assigned_to: [''],
      title: ['', Validators.required],
      description: [''],
      priority: ['media', Validators.required],
      status: ['pendente', Validators.required],
      due_date: [''],
      estimated_hours: [''],
      progress: [0]
    });
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadUsers();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.taskId = +id;
      this.loadTask(this.taskId);
    }
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (data) => this.projects = data,
      error: (err) => console.error('Erro ao carregar projetos', err)
    });
  }

  loadUsers(): void {
    this.http.get<User[]>('/api/users').subscribe({
      next: (data) => {
        this.users = data;
        // Auto-selecionar o utilizador atual se estiver na lista
        if (this.currentUser) {
          const current = this.users.find(u => u.id === this.currentUser?.id);
          if (current) {
            this.selectAssignee(current);
          }
        }
      },
      error: (err) => console.error('Erro ao carregar utilizadores', err)
    });
  }

  loadTask(id: number): void {
    this.loading = true;
    this.taskService.getTask(id).subscribe({
      next: (task) => {
        this.form.patchValue({
          project_id: task.project_id,
          assigned_to: task.assigned_to || '',
          title: task.title,
          description: task.description || '',
          priority: task.priority,
          status: task.status,
          due_date: task.due_date ? this.formatDate(task.due_date) : '',
          estimated_hours: task.estimated_hours || '',
          progress: task.progress || 0
        });
        
        // Carregar usuário atribuído
        if (task.assignee) {
          this.selectedAssignee = task.assignee;
        } else if (task.assigned_to) {
          const user = this.users.find(u => u.id === task.assigned_to);
          if (user) this.selectedAssignee = user;
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar tarefa', err);
        this.loading = false;
        this.router.navigate(['/tarefas']);
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

  selectAssignee(user: User | null): void {
    this.selectedAssignee = user;
    this.form.patchValue({ assigned_to: user?.id || '' });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const data = this.form.value;
    
    if (data.estimated_hours) data.estimated_hours = Number(data.estimated_hours);
    if (data.progress) data.progress = Number(data.progress);

    const request$ = this.isEditing 
      ? this.taskService.updateTask(this.taskId!, data)
      : this.taskService.createTask(data);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/tarefas']);
      },
      error: (err) => {
        console.error('Erro ao salvar', err);
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/tarefas']);
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getProgressColor(progress: number): string {
    if (progress < 30) return 'bg-red-500';
    if (progress < 60) return 'bg-yellow-500';
    if (progress < 90) return 'bg-blue-500';
    return 'bg-emerald-500';
  }
}