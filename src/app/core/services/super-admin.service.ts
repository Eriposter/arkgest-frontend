import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminService {
  private apiUrl = '/api/super-admin';

  constructor(private http: HttpClient) {}

  // ============================================
  // DASHBOARD
  // ============================================
  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  // ============================================
  // TENANTS
  // ============================================
  getTenants(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tenants`);
  }

  getTenant(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tenants/${id}`);
  }

  createTenant(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tenants`, data);
  }

  updateTenant(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/tenants/${id}`, data);
  }

  deleteTenant(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/tenants/${id}`);
  }

  toggleTenantStatus(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/tenants/${id}/toggle-status`, {});
  }

  // ============================================
  // LICENÇAS ✅ NOVO
  // ============================================
  getLicenses(filters?: any): Observable<any> {
  let params = new HttpParams();
  if (filters) {
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });
  }
  return this.http.get<any>(`${this.apiUrl}/licenses`, { params });
}

getLicense(id: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/licenses/${id}`);
}

createLicense(data: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/licenses`, data);
}

updateLicense(id: number, data: any): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/licenses/${id}`, data);
}

deleteLicense(id: number): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/licenses/${id}`);
}

renewLicense(id: number, durationDays?: number): Observable<any> {
  const body = durationDays ? { duration_days: durationDays } : {};
  return this.http.patch<any>(`${this.apiUrl}/licenses/${id}/renew`, body);
}

suspendLicense(id: number): Observable<any> {
  return this.http.patch<any>(`${this.apiUrl}/licenses/${id}/suspend`, {});
}

activateLicense(id: number): Observable<any> {
  return this.http.patch<any>(`${this.apiUrl}/licenses/${id}/activate`, {});
}

toggleLicenseStatus(id: number): Observable<any> {
  return this.http.patch<any>(`${this.apiUrl}/licenses/${id}/toggle`, {});
}

upgradeLicense(id: number, data: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/licenses/${id}/upgrade`, data);
}

// ✅ Helpers adicionais
getTypeBadge(type: string): string {
  const badges: any = {
    'trial': 'bg-blue-100 text-blue-700 border-blue-200',
    'monthly': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'yearly': 'bg-purple-100 text-purple-700 border-purple-200',
    'lifetime': 'bg-amber-100 text-amber-700 border-amber-200'
  };
  return badges[type] || 'bg-gray-100 text-gray-700';
}

getTypeLabel(type: string): string {
  const labels: any = {
    'trial': 'Trial',
    'monthly': 'Mensal',
    'yearly': 'Anual',
    'lifetime': 'Vitalício'
  };
  return labels[type] || type;
}

  // ============================================
  // HELPERS
  // ============================================
  getPlanLabel(plan: string): string {
    const labels: any = {
      'basic': 'Básico',
      'professional': 'Profissional',
      'enterprise': 'Empresarial'
    };
    return labels[plan] || plan;
  }

  getPlanBadge(plan: string): string {
    const badges: any = {
      'basic': 'bg-blue-100 text-blue-700 border-blue-200',
      'professional': 'bg-purple-100 text-purple-700 border-purple-200',
      'enterprise': 'bg-amber-100 text-amber-700 border-amber-200'
    };
    return badges[plan] || 'bg-gray-100 text-gray-700';
  }

  getStatusBadge(status: string): string {
    const badges: any = {
      'active': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'trial': 'bg-blue-100 text-blue-700 border-blue-200',
      'suspended': 'bg-red-100 text-red-700 border-red-200',
      'cancelled': 'bg-gray-100 text-gray-700 border-gray-200',
      'expired': 'bg-amber-100 text-amber-700 border-amber-200'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'active': 'Ativo',
      'trial': 'Trial',
      'suspended': 'Suspenso',
      'cancelled': 'Cancelado',
      'expired': 'Expirado'
    };
    return labels[status] || status;
  }

  getLicenseTypeLabel(type: string): string {
    const labels: any = {
      'trial': 'Trial',
      'monthly': 'Mensal',
      'yearly': 'Anual',
      'lifetime': 'Vitalício'
    };
    return labels[type] || type;
  }

  formatCurrency(value: number, currency: string = 'AOA'): string {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(value || 0);
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-PT');
  }

  getDaysRemaining(endDate: string): number | null {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
}