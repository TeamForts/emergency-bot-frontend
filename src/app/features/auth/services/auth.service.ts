import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface AuthResponse {
  access_token: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  currentUser = signal<{ role: string; token: string } | null>(null);

  constructor(private http: HttpClient) {
    const saved = localStorage.getItem('auth');
    if (saved) {
      try {
        this.currentUser.set(JSON.parse(saved));
      } catch {}
    }
  }

  login(username: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password });
  }

  saveAuth(data: AuthResponse) {
    const user = { role: data.role, token: data.access_token };
    this.currentUser.set(user);
    localStorage.setItem('auth', JSON.stringify(user));
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('auth');
  }

  getToken(): string | null {
    return this.currentUser()?.token ?? null;
  }
}
