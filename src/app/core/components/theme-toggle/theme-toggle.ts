import { Component } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: 'theme-toggle.html',
  styleUrls: ['theme-toggle.scss']
})
export class ThemeToggle {
  constructor(public theme: ThemeService) {}
}
