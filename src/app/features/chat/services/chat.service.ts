// src/app/features/chat/services/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';

export interface ChatResponse {
  reply: string;
  buttons?: string[];
}

export interface LogEntry {
  id: string;
  userId: number;
  role: string;
  message: string;
  incidentType?: string;
  timestamp: Date;
  resolved: boolean;
}

export interface PendingRequest {
  id: string;
  userId: number;
  message: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = 'http://localhost:3000/api/chat';

  constructor(private http: HttpClient, private auth: AuthService) {}

  sendMessage(message: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(this.apiUrl, { message }, { headers: this.getAuthHeaders() });
  }

  getLogs(): Observable<LogEntry[]> {
    return this.http.get<LogEntry[]>(`${this.apiUrl}/logs`, { headers: this.getAuthHeaders() });
  }

  getPending(): Observable<PendingRequest[]> {
    return this.http.get<PendingRequest[]>(`${this.apiUrl}/pending`, { headers: this.getAuthHeaders() });
  }

  answerRequest(requestId: string, reply: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/answer`, { requestId, reply }, { headers: this.getAuthHeaders() });
  }

  private getAuthHeaders(): any {
    const token = this.auth.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
