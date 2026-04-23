import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  selectedUser = signal('');
  password = signal('');

  constructor(private auth: AuthService) {}

  doLogin() {
    const username = this.selectedUser();
    const pass = this.password();
    if (!username || !pass) return;

    this.auth.login(username, pass).subscribe({
      next: (res) => {
        this.auth.saveAuth(res);
      },
      error: () => alert('Неверные учётные данные'),
    });
  }
}
