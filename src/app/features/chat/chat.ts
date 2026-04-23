// src/app/features/chat/chat.component.ts
import { Component, signal, effect, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ChatService } from './services/chat.service';
import { createMessage, Message } from './interfaces/message';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss'],
})
export class Chat implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages = signal<Message[]>([]);
  newMessage = signal('');
  isBotTyping = signal(false);
  private pollInterval: any;

  quickActions = [
    { icon: '🔥', label: 'Пожар', message: 'Пожар' },
    { icon: '🛢️', label: 'Утечка', message: 'Утечка газа' },
    { icon: '🚑', label: 'Травма', message: 'Травма' },
    { icon: '💥', label: 'Взрыв', message: 'Взрыв' },
  ];

  private readonly STORAGE_KEY = 'emergency-chat-history';

  constructor(private chatService: ChatService) {
    this.loadHistory();
    if (this.messages().length === 0) {
      this.messages.set([
        createMessage(
          'Здравствуйте! Я бот-помощник по действиям в чрезвычайных ситуациях. Выберите тип ЧС или опишите ситуацию.',
          'bot'
        ),
      ]);
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }

  private autoSave = effect(() => {
    const msgs = this.messages();
    if (msgs.length > 0) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(msgs));
    }
  });

  private loadHistory(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Message[];
        const withDates = parsed.map(m => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        this.messages.set(withDates);
      } catch {}
    }
  }

  sendMessage(text?: string): void {
    const userMsg = (text || this.newMessage()).trim();
    if (!userMsg) return;

    this.messages.update(msgs => [...msgs, createMessage(userMsg, 'user')]);
    this.newMessage.set('');
    this.isBotTyping.set(true);

    setTimeout(() => {
      this.chatService.sendMessage(userMsg).subscribe({
        next: (res) => {
          this.isBotTyping.set(false);
          this.messages.update(msgs => [
            ...msgs,
            createMessage(res.reply, 'bot', res.buttons),
          ]);

          if (res.reply.startsWith('Передаю ваш вопрос диспетчеру')) {
            this.startPollingForDispatcher();
          } else {
            this.stopPollingForDispatcher();
          }
        },
        error: (err) => {
          this.isBotTyping.set(false);
          this.messages.update(msgs => [
            ...msgs,
            createMessage('⚠️ Ошибка связи с сервером.', 'bot'),
          ]);
          console.error(err);
        },
      });
    }, 750);
  }

  sendQuickReply(buttonText: string) {
    this.sendMessage(buttonText);
  }

  clearHistory(): void {
    if (confirm('Очистить всю историю сообщений?')) {
      this.messages.set([]);
      localStorage.removeItem(this.STORAGE_KEY);
      this.messages.set([createMessage('История очищена. Чем могу помочь?', 'bot')]);
    }
  }

  private startPollingForDispatcher() {
    if (this.pollInterval) return;
    this.pollInterval = setInterval(() => {
      this.chatService.sendMessage('__check__').subscribe({
        next: (res) => {
          // Игнорируем пустой ответ или сообщение «Ожидайте…»
          if (res.reply && !res.reply.startsWith('Ожидайте ответа диспетчера')) {
            this.messages.update(msgs => [...msgs, createMessage(res.reply, 'bot', res.buttons)]);
            this.stopPollingForDispatcher();
          }
        },
        error: () => this.stopPollingForDispatcher(),
      });
    }, 5000);
  }

  private stopPollingForDispatcher() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}
