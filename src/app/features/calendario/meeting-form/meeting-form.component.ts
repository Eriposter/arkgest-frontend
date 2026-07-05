import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MeetingService } from '../../../core/services/meeting.service';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { Project } from '../../../core/models/project.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-meeting-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './meeting-form.component.html'
})
export class MeetingFormComponent implements OnInit {
  form: FormGroup;
  projects: Project[] = [];
  users: User[] = [];
  meetingType: 'reuniao_cliente' | 'visita_obra' | 'reuniao_equipa' | 'apresentacao' | 'outro' = 'reuniao_cliente';
  isEditing = false;
  meetingId: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private meetingService: MeetingService,
    private projectService: ProjectService,
    private userService: UserService,
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
      status: ['agendada', Validators.required],
      internal_participants: this.fb.array([]),
      external_guests: this.fb.array([])
    });
  }

  get internalParticipants(): FormArray {
    return this.form.get('internal_participants') as FormArray;
  }

  get externalGuests(): FormArray {
    return this.form.get('external_guests') as FormArray;
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadUsers();
    
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

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data.filter(u => u.is_active !== false);
      },
      error: (err) => console.error('Erro ao carregar utilizadores', err)
    });
  }

  loadMeeting(id: number): void {
    this.loading = true;
    this.meetingService.getMeeting(id).subscribe({
      next: (meeting: any) => {
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

        // ✅ CORREÇÃO: Aceitar tanto snake_case quanto camelCase
        // Laravel retorna 'meeting_participants' (snake_case)
        const participants = meeting.meeting_participants || meeting.meetingParticipants || [];

        // console.log('📋 Participantes carregados:', participants);

        // Limpar arrays
        this.internalParticipants.clear();
        this.externalGuests.clear();

        // Separar por tipo
        const internal = participants.filter((p: any) => p.participant_type === 'user');
        const external = participants.filter((p: any) => p.participant_type === 'guest');

        // console.log('👥 Internos:', internal);
        // console.log('📧 Externos:', external);

        // Adicionar participantes internos
        internal.forEach((p: any) => {
          this.internalParticipants.push(this.fb.group({
            user_id: [p.user_id, Validators.required],
            role: [p.role || 'participante']
          }));
        });

        // Adicionar convidados externos
        external.forEach((g: any) => {
          this.externalGuests.push(this.fb.group({
            name: [g.name, Validators.required],
            email: [g.email, [Validators.required, Validators.email]],
            role: [g.role || 'convidado']
          }));
        });

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

  // ✅ Métodos para Participantes Internos
  addInternalParticipant(): void {
    this.internalParticipants.push(this.fb.group({
      user_id: ['', Validators.required],
      role: ['participante']
    }));
  }

  removeInternalParticipant(index: number): void {
    this.internalParticipants.removeAt(index);
  }

  // ✅ Métodos para Convidados Externos
  addExternalGuest(): void {
    this.externalGuests.push(this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['convidado']
    }));
  }

  removeExternalGuest(index: number): void {
    this.externalGuests.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const data = { ...this.form.value };

    // console.log('📤 Dados a enviar:', data);

    const request$ = this.isEditing 
      ? this.meetingService.updateMeeting(this.meetingId!, data)
      : this.meetingService.createMeeting(data);

    request$.subscribe({
      next: (response) => {
        // console.log('✅ Reunião salva:', response);
        this.router.navigate(['/calendario']);
      },
      error: (err) => {
        console.error('❌ Erro ao salvar', err);
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/calendario']);
  }
}