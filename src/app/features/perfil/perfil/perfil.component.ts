import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../../core/services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html'
})
export class PerfilComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  
  activeTab: 'info' | 'password' = 'info';
  loading = false;
  passwordLoading = false;
  
  user: User | null = null;
  avatarPreview: string | null = null;
  selectedFile: File | null = null;
  
  showPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  
  message = '';
  messageType: 'success' | 'error' = 'success';
  
  passwordMessage = '';
  passwordMessageType: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      position: ['']
    });

    this.passwordForm = this.fb.group({
      current_password: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.profileService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.avatarPreview = user.avatar_url ? user.avatar_url : null;
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          position: user.position || ''
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar perfil', err);
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeAvatar(): void {
    this.avatarPreview = this.user?.avatar_url || null;
    this.selectedFile = null;
  }

  onSubmitProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formData = new FormData();
    
    // FormData requer append manual
    formData.append('name', this.profileForm.get('name')?.value);
    formData.append('email', this.profileForm.get('email')?.value);
    formData.append('phone', this.profileForm.get('phone')?.value || '');
    formData.append('position', this.profileForm.get('position')?.value || '');
    
    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile);
    }

    this.profileService.updateProfile(formData).subscribe({
      next: (response) => {
        this.user = response.user;
        this.selectedFile = null;
        this.showMessage('Perfil atualizado com sucesso!', 'success');
        
        // Atualizar dados no AuthService/localStorage
        const stored = localStorage.getItem('user');
        if (stored) {
          const userData = JSON.parse(stored);
          userData.name = response.user.name;
          localStorage.setItem('user', JSON.stringify(userData));
          this.authService.user$;
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao atualizar perfil', err);
        this.showMessage('Erro ao atualizar perfil. Tente novamente.', 'error');
        this.loading = false;
      }
    });
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    if (this.passwordForm.get('password')?.value !== this.passwordForm.get('password_confirmation')?.value) {
      this.showPasswordMessage('As senhas não coincidem.', 'error');
      return;
    }

    this.passwordLoading = true;
    
    this.profileService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.showPasswordMessage('Senha alterada com sucesso!', 'success');
        this.passwordForm.reset();
        this.passwordLoading = false;
      },
      error: (err) => {
        console.error('Erro ao alterar senha', err);
        if (err.error?.errors?.current_password) {
          this.showPasswordMessage('Senha atual incorreta.', 'error');
        } else {
          this.showPasswordMessage('Erro ao alterar senha. Tente novamente.', 'error');
        }
        this.passwordLoading = false;
      }
    });
  }

  showMessage(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => this.message = '', 5000);
  }

  showPasswordMessage(msg: string, type: 'success' | 'error'): void {
    this.passwordMessage = msg;
    this.passwordMessageType = type;
    setTimeout(() => this.passwordMessage = '', 5000);
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getRoleLabel(role: string): string {
    const labels: any = {
      'admin': 'Administrador',
      'gestor': 'Gestor',
      'arquiteto': 'Arquiteto',
      'estagiario': 'Estagiário'
    };
    return labels[role] || role;
  }

  getRoleBadge(role: string): string {
    const badges: any = {
      'admin': 'bg-purple-100 text-purple-700 border-purple-200',
      'gestor': 'bg-blue-100 text-blue-700 border-blue-200',
      'arquiteto': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'estagiario': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return badges[role] || 'bg-gray-100 text-gray-700';
  }
}