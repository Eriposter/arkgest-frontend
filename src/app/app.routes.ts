import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './core/components/layout/layout.component';

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
        path: 'projetos',
        loadComponent: () =>
          import('./features/projetos/projetos/projetos.component').then(
            (m) => m.ProjetosComponent,
          ),
      },
      {
        path: 'projetos/novo',
        loadComponent: () =>
          import('./features/projetos/projeto-form/projeto-form.component').then(
            (m) => m.ProjetoFormComponent,
          ),
      },
      {
        path: 'projetos/:id/editar',
        loadComponent: () =>
          import('./features/projetos/projeto-form/projeto-form.component').then(
            (m) => m.ProjetoFormComponent,
          ),
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
  loadComponent: () => import('./features/calendario/calendario/calendario.component').then(m => m.CalendarioComponent)
},
{
  path: 'calendario/novo',
  loadComponent: () => import('./features/calendario/meeting-form/meeting-form.component').then(m => m.MeetingFormComponent)
},
{
  path: 'calendario/:id/editar',
  loadComponent: () => import('./features/calendario/meeting-form/meeting-form.component').then(m => m.MeetingFormComponent)
},
{
  path: 'faturas',
  loadComponent: () => import('./features/financeiro/faturas/faturas.component').then(m => m.FaturasComponent)
},
{
  path: 'faturas/novo',
  loadComponent: () => import('./features/financeiro/fatura-form/fatura-form.component').then(m => m.FaturaFormComponent)
},
{
  path: 'faturas/:id/editar',
  loadComponent: () => import('./features/financeiro/fatura-form/fatura-form.component').then(m => m.FaturaFormComponent)
},
{
  path: 'relatorios',
  loadComponent: () => import('./features/relatorios/relatorios/relatorios.component').then(m => m.RelatoriosComponent)
},
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
