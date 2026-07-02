import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MeetingService } from '../../../core/services/meeting.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-meeting-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './meeting-form.component.html'
})
export class MeetingFormComponent implements OnInit {
  form: FormGroup;
  projects: Project[] = [];
  meetingType: 'reuniao_cliente' | 'visita_obra' | 'reuniao_equipa' | 'apresentacao' | 'outro' = 'reuniao_cliente';
  isEditing = false;
  meetingId: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private meetingService: MeetingService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      project_id: [''],
      title: ['', Validators.required],
      description: [''],
      type: ['reuniao_cliente', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      location: [''],
      meeting_link: [''],
      status: ['agendada', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProjects();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.meetingId = +id;
      this.loadMeeting(this.meetingId);
    }
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (data) => this.projects = data,
      error: (err) => console.error('Erro ao carregar projetos', err)
    });
  }

  loadMeeting(id: number): void {
    this.loading = true;
    this.meetingService.getMeeting(id).subscribe({
      next: (meeting) => {
        this.form.patchValue({
          project_id: meeting.project_id || '',
          title: meeting.title,
          description: meeting.description || '',
          type: meeting.type,
          start_time: this.formatDateTimeLocal(meeting.start_time),
          end_time: this.formatDateTimeLocal(meeting.end_time),
          location: meeting.location || '',
          meeting_link: meeting.meeting_link || '',
          status: meeting.status
        });
        
        this.meetingType = meeting.type || 'reuniao_cliente';
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar reunião', err);
        this.loading = false;
        this.router.navigate(['/calendario']);
      }
    });
  }

  formatDateTimeLocal(dateTime: string): string {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  selectType(type: 'reuniao_cliente' | 'visita_obra' | 'reuniao_equipa' | 'apresentacao' | 'outro'): void {
    this.meetingType = type;
    this.form.patchValue({ type });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const data = this.form.value;

    const request$ = this.isEditing 
      ? this.meetingService.updateMeeting(this.meetingId!, data)
      : this.meetingService.createMeeting(data);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/calendario']);
      },
      error: (err) => {
        console.error('Erro ao salvar', err);
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/calendario']);
  }
}