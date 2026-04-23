// src/app/features/dispatcher/dispatcher.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ChatService, PendingRequest, LogEntry } from '../chat/services/chat.service';

@Component({
  selector: 'app-dispatcher',
  imports: [FormsModule, DatePipe],
  templateUrl: './dispatcher.html',
  styleUrls: ['./dispatcher.scss'],
})
export class Dispatcher implements OnInit {
  pendingRequests = signal<PendingRequest[]>([]);
  logs = signal<LogEntry[]>([]);
  replies = signal<Record<string, string>>({});

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.loadPending();
    this.loadLogs();
    setInterval(() => {
      this.loadPending();
      this.loadLogs();
    }, 10000);
  }

  loadPending() {
    this.chatService.getPending().subscribe(data => this.pendingRequests.set(data));
  }

  loadLogs() {
    this.chatService.getLogs().subscribe(data => this.logs.set(data));
  }

  setReply(requestId: string, value: string) {
    this.replies.update(prev => ({ ...prev, [requestId]: value }));
  }

  sendReply(requestId: string) {
    const reply = this.replies()[requestId];
    if (!reply) return;

    this.chatService.answerRequest(requestId, reply).subscribe(() => {
      // Удаляем ответ после успешной отправки
      this.replies.update(prev => {
        const updated = { ...prev };
        delete updated[requestId];
        return updated;
      });
      // Обновляем данные
      this.loadPending();
      this.loadLogs();
    });
  }
}
