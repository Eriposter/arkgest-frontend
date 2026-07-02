import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-menu.component.html'
})
export class UserMenuComponent {
  user: User | null = null;
  showMenu = false;

  constructor(private authService: AuthService) {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}