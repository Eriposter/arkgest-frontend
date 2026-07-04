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
      console.log('✅ Login bem-sucedido:', response);
      console.log('🎭 ROLE do utilizador:', response.user.role); // ← ADICIONAR ISTO
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