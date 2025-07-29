import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CharacterTableComponent } from './components/character-table/character-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.css'],
})
export class AppComponent {
logout() {
throw new Error('Method not implemented.');
}
  
  
  constructor(
    public authService: AuthService,
    public router: Router
  ) {}
}