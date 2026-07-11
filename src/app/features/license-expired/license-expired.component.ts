import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-license-expired',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './license-expired.component.html'
})
export class LicenseExpiredComponent implements OnInit {
  licenseInfo: any = null;
  userName = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const stored = sessionStorage.getItem('license_expired_info');
    if (stored) {
      this.licenseInfo = JSON.parse(stored);
    }
    this.userName = this.authService.getUser()?.name || 'Utilizador';
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      sessionStorage.removeItem('license_expired_info');
      this.router.navigate(['/auth/login']);
    });
  }
}