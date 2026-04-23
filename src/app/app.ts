
import { Component, signal } from '@angular/core';
import { AuthService } from './features/auth/services/auth.service';
import { Login } from './features/auth/components/login/login';
import { ThemeToggle } from './core/components/theme-toggle/theme-toggle';
import {EvacuationMap} from './features/evacuation-map/evacuation-map';
import {Chat} from './features/chat/chat';
import {Dispatcher} from './features/dispatcher/dispatcher';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Login, Chat, EvacuationMap, ThemeToggle, Dispatcher],
  templateUrl: 'app.html',
  styleUrls: ['app.scss'],
})
export class App {
  activeTab = signal<'chat' | 'map' | 'dispatcher'>('chat');

  constructor(public auth: AuthService) {}

  getUserName(): string {
    const user = this.auth.currentUser();
    if (user?.role === 'worker') return 'Работник';
    if (user?.role === 'dispatcher') return 'Диспетчер';
    return 'Гость';
  }

  logout() {
    this.auth.logout();
    this.activeTab.set('chat');
  }
}
