import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, UserMenuComponent],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  searchQuery = '';
  
  notifications = [
    { id: 1, title: 'Nova tarefa atribuída', time: 'Há 2 horas', read: false },
    { id: 2, title: 'Reunião amanhã às 14h', time: 'Há 4 horas', read: false },
    { id: 3, title: 'Documento aprovado', time: 'Há 1 dia', read: true },
  ];

  unreadCount = 2;
  showNotifications = false;

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(id: number): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }
  }
}