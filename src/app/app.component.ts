import { Component } from '@angular/core';
import { CharacterTableComponent } from './components/character-table/character-table.component';

@Component({
  selector: 'app-root',
  imports: [CharacterTableComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.css']  // Asegúrate que exista este archivo o cámbialo por './app.component.css'
})
export class AppComponent {
  title = 'Rick and Morty App';
}
