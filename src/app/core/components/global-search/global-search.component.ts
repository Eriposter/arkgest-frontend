import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchService, SearchResult, SearchResponse } from '../../services/search.service';
import { Subscription } from 'rxjs';

interface FlatResult extends SearchResult {
  category: string;
}

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.css']
})
export class GlobalSearchComponent implements OnInit, OnDestroy {
  isOpen = false;
  query = '';
  loading = false;
  results: SearchResponse | null = null;
  flatResults: FlatResult[] = [];
  selectedIndex = -1;
  
  private searchSubscription!: Subscription;

  constructor(
    private searchService: SearchService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchService.search('').subscribe();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  // ✅ Atalho Ctrl+K / Cmd+K
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Ctrl+K ou Cmd+K para abrir
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.toggle();
    }
    
    // Escape para fechar
    if (event.key === 'Escape' && this.isOpen) {
      this.close();
    }

    // Navegação por setas
    if (this.isOpen && this.flatResults.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.flatResults.length - 1);
        this.scrollToSelected();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.scrollToSelected();
      } else if (event.key === 'Enter' && this.selectedIndex >= 0) {
        event.preventDefault();
        this.selectResult(this.flatResults[this.selectedIndex]);
      }
    }
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.query = '';
      this.results = null;
      this.flatResults = [];
      this.selectedIndex = -1;
      // Focar no input após abrir
      setTimeout(() => {
        const input = document.getElementById('global-search-input');
        if (input) input.focus();
      }, 100);
    }
  }

  open(): void {
    if (!this.isOpen) this.toggle();
  }

  close(): void {
    this.isOpen = false;
    this.query = '';
    this.results = null;
    this.flatResults = [];
    this.selectedIndex = -1;
  }

  onQueryChange(): void {
    if (this.query.length < 2) {
      this.results = null;
      this.flatResults = [];
      return;
    }

    this.loading = true;
    this.selectedIndex = -1;
    
    this.searchService.search(this.query).subscribe({
      next: (data) => {
        this.results = data;
        this.flattenResults();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro na pesquisa', err);
        this.loading = false;
      }
    });
  }

  private flattenResults(): void {
    if (!this.results) return;
    
    this.flatResults = [];
    const categories = ['projects', 'clients', 'tasks', 'invoices', 'meetings', 'users'];
    
    categories.forEach(category => {
      const items = (this.results!.results as any)[category] || [];
      items.forEach((item: SearchResult) => {
        this.flatResults.push({ ...item, category });
      });
    });
  }

  selectResult(result: FlatResult): void {
    this.close();
    this.router.navigate([result.url.split('/')]);
  }

  scrollToSelected(): void {
    setTimeout(() => {
      const element = document.querySelector(`[data-result-index="${this.selectedIndex}"]`);
      if (element) {
        element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }, 0);
  }

  getCategoryLabel(category: string): string {
    return this.searchService.getCategoryLabel(category);
  }

  getCategoryIcon(category: string): string {
    return this.searchService.getCategoryIcon(category);
  }

  getCategoryColor(category: string): string {
    return this.searchService.getCategoryColor(category);
  }

  getCategories(): string[] {
    if (!this.results) return [];
    return ['projects', 'clients', 'tasks', 'invoices', 'meetings', 'users'].filter(
      cat => (this.results!.results as any)[cat]?.length > 0
    );
  }

  getResultsByCategory(category: string): SearchResult[] {
    if (!this.results) return [];
    return (this.results.results as any)[category] || [];
  }

  getGlobalIndex(category: string, itemIndex: number): number {
    let index = 0;
    const categories = this.getCategories();
    for (const cat of categories) {
      if (cat === category) {
        return index + itemIndex;
      }
      index += this.getResultsByCategory(cat).length;
    }
    return -1;
  }

  createFlatResult(item: SearchResult, category: string): FlatResult {
    return { ...item, category };
  }

}