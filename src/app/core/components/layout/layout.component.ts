import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-sidebar></app-sidebar>
      
      <div class="lg:pl-64 flex flex-col flex-1">
        <app-header></app-header>
        
        <main class="flex-1">
          <div class="py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <router-outlet></router-outlet>
            </div>
          </div>
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent {}