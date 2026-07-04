import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-utilizador-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './utilizador-form.component.html'
})
export class UtilizadorFormComponent implements OnInit {
  form: FormGroup;
  roles: any[] = [];
  isEditing = false;
  userId: number | null = null;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(8)]],
      password_confirmation: [''],
      phone: [''],
      position: [''],
      role: ['', Validators.required],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.userId = +id;
      this.loadUser(this.userId);
    } else {
      // Nova senha é obrigatória ao criar
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    }
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (data) => this.roles = data,
      error: (err) => console.error('Erro ao carregar roles', err)
    });
  }

  loadUser(id: number): void {
    this.loading = true;
    this.userService.getUser(id).subscribe({
      next: (user) => {
        this.form.patchValue({
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          position: user.position || '',
          role: user.role || '',
          is_active: user.is_active
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar utilizador', err);
        this.loading = false;
        this.router.navigate(['/utilizadores']);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Verificar se as senhas coincidem
    if (this.form.get('password')?.value && this.form.get('password')?.value !== this.form.get('password_confirmation')?.value) {
      alert('As senhas não coincidem');
      return;
    }

    this.loading = true;
    const data = { ...this.form.value };

    // Remover password_confirmation antes de enviar
    delete data.password_confirmation;

    // Se não está a editar e a senha está vazia, não enviar
    if (!this.isEditing && !data.password) {
      delete data.password;
    }

    const request$ = this.isEditing 
      ? this.userService.updateUser(this.userId!, data)
      : this.userService.createUser(data);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/utilizadores']);
      },
      error: (err) => {
        console.error('Erro ao salvar', err);
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/utilizadores']);
  }

  getRoleBadge(role: string): string {
    const badges: any = {
      'admin': 'bg-purple-100 text-purple-700',
      'gestor': 'bg-blue-100 text-blue-700',
      'arquiteto': 'bg-emerald-100 text-emerald-700',
      'estagiario': 'bg-gray-100 text-gray-700'
    };
    return badges[role] || 'bg-gray-100 text-gray-700';
  }
}