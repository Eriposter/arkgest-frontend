import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  private newNotification$ = new Subject<any>();
  private channels: any[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnDestroy(): void {
    this.leaveAllChannels();
  }

  // ✅ Ouvir notificações do utilizador atual
  listenToUserNotifications(userId: number): void {
  // ✅ Usar channel() em vez de private()
  const channel = window.Echo.channel(`notifications.${userId}`)
    .listen('.new.notification', (data: any) => {
      console.log('🔔 Nova notificação recebida:', data);
      this.newNotification$.next(data);
      this.showBrowserNotification(data.title, data.message);
      this.notificationService.refreshNotifications();
    });

  this.channels.push(channel);
}

  // ✅ Ouvir eventos de projeto
  listenToProject(projectId: number): void {
    const channel = window.Echo.private(`project.${projectId}`)
      .listen('.task.created', (data: any) => {
        console.log('📋 Nova tarefa no projeto:', data);
      })
      .listen('.meeting.created', (data: any) => {
        console.log('📅 Nova reunião no projeto:', data);
      });

    this.channels.push(channel);
  }

  // ✅ Observable para componentes subscritos
  onNewNotification() {
    return this.newNotification$.asObservable();
  }

  // ✅ Sair de todos os canais
  leaveAllChannels(): void {
    this.channels.forEach(channel => {
      if (channel && channel.unsubscribe) {
        channel.unsubscribe();
      }
    });
    this.channels = [];
  }

  // ✅ Mostrar notificação do browser
  private showBrowserNotification(title: string, body: string): void {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/assets/icons/icon-128x128.png',
        badge: '/assets/icons/icon-72x72.png',
        tag: 'arkgest-notification'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  }
}