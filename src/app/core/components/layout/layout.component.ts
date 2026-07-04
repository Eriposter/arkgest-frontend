import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Sidebar Fixo -->
      <app-sidebar></app-sidebar>
      
      <!-- Área Principal (Header + Conteúdo) -->
      <div class="lg:pl-64 flex flex-col min-h-screen">
        
        <!-- Header Fixo -->
        <div class="sticky top-0 z-20 bg-white border-b border-gray-200">
          <app-header></app-header>
        </div>
        
        <!-- Conteúdo Principal com scroll -->
        <main class="flex-1 overflow-y-auto">
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