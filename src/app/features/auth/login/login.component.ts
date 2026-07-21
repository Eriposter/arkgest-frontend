import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  showPassword = false;
  errorMessage = '';
  message: { type: 'info' | 'warning' | 'error', text: string } | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
  const reason = sessionStorage.getItem('logout_reason');
  
  if (reason === 'inactivity') {
    this.message = {
      type: 'warning',
      text: '⚠️ A sua sessão foi encerrada por inatividade. Por favor, faça login novamente.'
    };
    sessionStorage.removeItem('logout_reason');
  }
}

  onSubmit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.loading = true;
  this.errorMessage = '';

  const { email, password } = this.form.value;

  this.authService.login(email, password).subscribe({
    next: (response) => {
      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      console.error('❌ Erro no login:', err);
      this.errorMessage = err.error?.message || 'Credenciais inválidas. Tente novamente.';
      this.loading = false;
    }
  });
}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}