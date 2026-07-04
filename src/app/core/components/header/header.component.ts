import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, UserMenuComponent],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  
  searchQuery = '';
  showNotifications = false;
  notifications: Notification[] = [];
  unreadCount = 0;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data.notifications;
        this.unreadCount = data.unread_count;
      },
      error: (err) => console.error('Erro ao carregar notificações', err)
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications && this.unreadCount > 0) {
      // Opcional: marcar todas como lidas ao abrir
      // this.notificationService.markAllAsRead().subscribe(() => this.loadNotifications());
    }
  }

  markAsRead(notification: Notification): void {
    if (!notification.read_at) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => this.loadNotifications()
      });
    }
  }

  getIconColor(type: string): string {
    switch(type) {
      case 'task': return 'bg-blue-100 text-blue-600';
      case 'invoice': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }
}