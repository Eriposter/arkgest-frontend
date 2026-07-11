import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import { GlobalSearchComponent } from '../global-search/global-search.component';
import { NotificationService } from '../../services/notification.service';
import { WebSocketService } from '../../services/websocket.service';
import { AuthService } from '../../services/auth.service';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    UserMenuComponent,
    GlobalSearchComponent
  ],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  @ViewChild(GlobalSearchComponent) globalSearch!: GlobalSearchComponent;
  
  searchQuery = '';
  showNotifications = false;
  notifications: Notification[] = [];
  unreadCount = 0;
  hasNewNotification = false;
  isSuperAdmin = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private webSocketService: WebSocketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.setupWebSocket();
    this.checkSuperAdmin();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.webSocketService.leaveAllChannels();
  }

  checkSuperAdmin(): void {
  const user = this.authService.getUser();
  this.isSuperAdmin = user?.role?.includes('super-admin') || false;
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

  setupWebSocket(): void {
    const user = this.authService.getUser();
    if (user?.id) {
      this.webSocketService.listenToUserNotifications(user.id);

      const sub = this.webSocketService.onNewNotification().subscribe({
        next: (notification) => {
          this.hasNewNotification = true;
          setTimeout(() => this.hasNewNotification = false, 3000);
        }
      });
      this.subscriptions.push(sub);

      const refreshSub = this.notificationService.onRefresh().subscribe(() => {
        this.loadNotifications();
      });
      this.subscriptions.push(refreshSub);
    }
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(notification: Notification): void {
    if (!notification.read_at) {
        this.notificationService.markAsRead(Number(notification.id)).subscribe({
        next: () => this.loadNotifications()
      });
    }
  }

  openSearch(): void {
    if (this.globalSearch) {
      this.globalSearch.open();
    }
  }

  getIconColor(type: string): string {
    switch(type) {
      case 'task': return 'bg-blue-100 text-blue-600';
      case 'invoice': return 'bg-green-100 text-green-600';
      case 'meeting': return 'bg-amber-100 text-amber-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }
}