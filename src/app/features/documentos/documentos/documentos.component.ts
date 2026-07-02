import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../../core/services/document.service';
import { ProjectService } from '../../../core/services/project.service';
import { Document } from '../../../core/models/document.model';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documentos.component.html'
})
export class DocumentosComponent implements OnInit {
  documents: Document[] = [];
  filteredDocuments: Document[] = [];
  projects: Project[] = [];
  loading = true;
  uploading = false;
  
  // Stats
  stats = {
    total: 0,
    pdfs: 0,
    images: 0,
    others: 0,
    totalSize: 0
  };

  // Upload state
  selectedFile: File | null = null;
  selectedProjectId: number | null = null;
  category = '';
  description = '';

  // Filtros
  searchTerm = '';
  projectFilter = 'all';
  typeFilter = 'all';

  constructor(
    public documentService: DocumentService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadDocuments();
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (data) => this.projects = data,
      error: (err) => console.error('Erro ao carregar projetos', err)
    });
  }

  loadDocuments(): void {
    this.loading = true;
    this.documentService.getDocuments().subscribe({
      next: (data) => {
        this.documents = data;
        this.filteredDocuments = data;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar documentos', err);
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.documents.length;
    this.stats.pdfs = this.documents.filter(d => d.mime_type?.includes('pdf')).length;
    this.stats.images = this.documents.filter(d => d.mime_type?.includes('image')).length;
    this.stats.others = this.documents.filter(d => !d.mime_type?.includes('pdf') && !d.mime_type?.includes('image')).length;
    this.stats.totalSize = this.documents.reduce((acc, d) => acc + (d.file_size || 0), 0);
  }

  applyFilters(): void {
    let result = [...this.documents];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(d => 
        d.file_name?.toLowerCase().includes(term) ||
        d.description?.toLowerCase().includes(term) ||
        d.project?.name?.toLowerCase().includes(term)
      );
    }

    if (this.projectFilter !== 'all') {
      result = result.filter(d => d.project_id === Number(this.projectFilter));
    }

    if (this.typeFilter !== 'all') {
      result = result.filter(d => {
        if (this.typeFilter === 'pdf') return d.mime_type?.includes('pdf');
        if (this.typeFilter === 'image') return d.mime_type?.includes('image');
        if (this.typeFilter === 'document') return d.mime_type?.includes('word') || d.mime_type?.includes('document');
        if (this.typeFilter === 'spreadsheet') return d.mime_type?.includes('excel') || d.mime_type?.includes('sheet');
        return true;
      });
    }

    this.filteredDocuments = result;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.projectFilter = 'all';
    this.typeFilter = 'all';
    this.filteredDocuments = this.documents;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  upload(): void {
    if (!this.selectedFile || !this.selectedProjectId) {
      alert('Selecione um ficheiro e um projeto.');
      return;
    }

    this.uploading = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('project_id', this.selectedProjectId.toString());
    if (this.category) formData.append('category', this.category);
    if (this.description) formData.append('description', this.description);

    this.documentService.uploadDocument(formData).subscribe({
      next: () => {
        this.resetForm();
        this.loadDocuments();
        this.uploading = false;
      },
      error: (err) => {
        console.error('Erro no upload', err);
        this.uploading = false;
      }
    });
  }

  deleteDocument(id: number): void {
    if (confirm('Tem a certeza que deseja eliminar este documento?')) {
      this.documentService.deleteDocument(id).subscribe({
        next: () => this.loadDocuments(),
        error: (err) => console.error('Erro ao eliminar', err)
      });
    }
  }

  getFileIcon(mimeType: string): string {
    if (mimeType?.includes('pdf')) return 'pdf';
    if (mimeType?.includes('image')) return 'image';
    if (mimeType?.includes('word') || mimeType?.includes('document')) return 'word';
    if (mimeType?.includes('excel') || mimeType?.includes('sheet')) return 'excel';
    if (mimeType?.includes('presentation') || mimeType?.includes('powerpoint')) return 'presentation';
    if (mimeType?.includes('zip') || mimeType?.includes('compressed')) return 'zip';
    return 'file';
  }

  getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toUpperCase() || 'FILE';
  }

  resetForm(): void {
    this.selectedFile = null;
    this.category = '';
    this.description = '';
  }
}