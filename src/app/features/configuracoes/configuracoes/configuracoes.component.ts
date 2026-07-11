import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { SettingService } from '../../../core/services/setting.service';
import { LicenseInfoComponent } from '../../settings/license-info/license-info.component';


@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LicenseInfoComponent],
  templateUrl: './configuracoes.component.html'
})
export class ConfiguracoesComponent implements OnInit {
  form: FormGroup;
  activeTab: 'empresa' | 'faturacao' | 'license' | 'sistema' = 'empresa';
  loading = false;
  logoPreview: string | null = null;
  selectedLogo: File | null = null;
  message = '';

  constructor(private fb: FormBuilder, private settingService: SettingService) {
    this.form = this.fb.group({
      company_name: [''],
      company_slogan: [''],
      company_email: [''],
      company_phone: [''],
      company_address: [''],
      company_nif: [''],
      currency: ['AOA'],
      invoice_prefix: ['FAT'],
      invoice_due_days: ['30'],
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.settingService.getSettings().subscribe({
      next: (settings) => {
        this.form.patchValue(settings);
        if (settings.company_logo) {
          this.logoPreview = `http://localhost:8000/storage/${settings.company_logo}`;
        }
      },
      error: (err) => console.error('Erro ao carregar configurações', err)
    });
  }

  onLogoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedLogo = file;
      const reader = new FileReader();
      reader.onload = (e) => this.logoPreview = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    this.loading = true;
    const formData = new FormData();
    
    Object.keys(this.form.value).forEach(key => {
      if (this.form.value[key]) {
        formData.append(key, this.form.value[key]);
      }
    });

    if (this.selectedLogo) {
      formData.append('logo_file', this.selectedLogo);
    }

    this.settingService.updateSettings(formData).subscribe({
      next: (res) => {
        this.message = 'Configurações guardadas com sucesso!';
        this.loading = false;
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        console.error('Erro ao salvar', err);
        this.loading = false;
      }
    });
  }
}