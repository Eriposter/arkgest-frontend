import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './core/components/layout/layout.component';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
  path: 'projetos/novo',
  loadComponent: () => import('./features/projetos/projeto-form/projeto-form.component').then(m => m.ProjetoFormComponent)
},
{
  path: 'projetos/:id/editar',
  loadComponent: () => import('./features/projetos/projeto-form/projeto-form.component').then(m => m.ProjetoFormComponent)
},
{
  path: 'projetos/:id',
  loadComponent: () => import('./features/projetos/project-details/project-details.component').then(m => m.ProjectDetailsComponent)
},
// ✅ Lista por último
{
  path: 'projetos',
  loadComponent: () => import('./features/projetos/projetos/projetos.component').then(m => m.ProjetosComponent)
},
      {
        path: 'tarefas',
        loadComponent: () =>
          import('./features/tarefas/tarefas/tarefas.component').then(
            (m) => m.TarefasComponent,
          ),
      },
      {
        path: 'tarefas/novo',
        loadComponent: () =>
          import('./features/tarefas/tarefa-form/tarefa-form.component').then(
            (m) => m.TarefaFormComponent,
          ),
      },
      {
        path: 'tarefas/:id/editar',
        loadComponent: () =>
          import('./features/tarefas/tarefa-form/tarefa-form.component').then(
            (m) => m.TarefaFormComponent,
          ),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/clientes/clientes/clientes.component').then(
            (m) => m.ClientesComponent,
          ),
      },
      {
        path: 'clientes/novo',
        loadComponent: () =>
          import('./features/clientes/cliente-form/cliente-form.component').then(
            (m) => m.ClienteFormComponent,
          ),
      },
      {
        path: 'clientes/:id/editar',
        loadComponent: () =>
          import('./features/clientes/cliente-form/cliente-form.component').then(
            (m) => m.ClienteFormComponent,
          ),
      },
      {
        path: 'documentos',
        loadComponent: () =>
          import('./features/documentos/documentos/documentos.component').then(
            (m) => m.DocumentosComponent,
          ),
      },
      {
        path: 'calendario',
        loadComponent: () =>
          import('./features/calendario/calendario/calendario.component').then(
            (m) => m.CalendarioComponent,
          ),
      },
      {
        path: 'calendario/novo',
        loadComponent: () =>
          import('./features/calendario/meeting-form/meeting-form.component').then(
            (m) => m.MeetingFormComponent,
          ),
      },
      {
        path: 'calendario/:id/editar',
        loadComponent: () =>
          import('./features/calendario/meeting-form/meeting-form.component').then(
            (m) => m.MeetingFormComponent,
          ),
      },
      {
        path: 'faturas',
        loadComponent: () =>
          import('./features/financeiro/faturas/faturas.component').then(
            (m) => m.FaturasComponent,
          ),
      },
      {
        path: 'faturas/novo',
        loadComponent: () =>
          import('./features/financeiro/fatura-form/fatura-form.component').then(
            (m) => m.FaturaFormComponent,
          ),
      },
      {
        path: 'faturas/:id/editar',
        loadComponent: () =>
          import('./features/financeiro/fatura-form/fatura-form.component').then(
            (m) => m.FaturaFormComponent,
          ),
      },
      {
        path: 'relatorios',
        loadComponent: () =>
          import('./features/relatorios/relatorios/relatorios.component').then(
            (m) => m.RelatoriosComponent,
          ),
      },
      {
        path: 'utilizadores',
        loadComponent: () =>
          import('./features/utilizadores/utilizadores/utilizadores.component').then(
            (m) => m.UtilizadoresComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['admin'] }, // Apenas Admin
      },
      {
        path: 'utilizadores/novo',
        loadComponent: () =>
          import('./features/utilizadores/utilizador-form/utilizador-form.component').then(
            (m) => m.UtilizadorFormComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['admin'] }, // Apenas Admin
      },
      {
        path: 'utilizadores/:id/editar',
        loadComponent: () =>
          import('./features/utilizadores/utilizador-form/utilizador-form.component').then(
            (m) => m.UtilizadorFormComponent,
          ),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/perfil/perfil/perfil.component').then(
            (m) => m.PerfilComponent,
          ),
      },
      {
        path: 'configuracoes',
        loadComponent: () =>
          import('./features/configuracoes/configuracoes/configuracoes.component').then(
            (m) => m.ConfiguracoesComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('./features/audit/audit-log/audit-log.component').then(
            (m) => m.AuditLogComponent,
          ),
        data: { roles: ['admin'] },
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
