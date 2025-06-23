import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-character-table',
  imports: [CommonModule],
  templateUrl: './character-table.component.html',
  styleUrls: ['./character-table.component.css']
})
export class CharacterTableComponent implements OnInit {
  URL1 = 'https://rickandmortyapi.com/api/character';
  URL2 = 'https://rickandmortyapi.com/api/character/?name=';
  characters: any[] = [];
  sortDirection: 'asc' | 'desc' = 'asc';
  charactersCache: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.generateAllCharacters();
  }

  getApi(url: string) {
    return this.http.get<any>(url);
  }

  generateAllCharacters(sortBy: string | null = null) {
    this.getApi(this.URL1).subscribe(data => {
      this.charactersCache = data.results || [];
      let charactersToShow = [...this.charactersCache];

      if (sortBy) {
        charactersToShow.sort((a, b) => {
          if (a[sortBy] < b[sortBy]) return this.sortDirection === 'asc' ? -1 : 1;
          if (a[sortBy] > b[sortBy]) return this.sortDirection === 'asc' ? 1 : -1;
          return 0;
        });
      }

      this.characters = charactersToShow;
    });
  }

  getCharacterByName(term: string) {
    const value = term.trim();
    if (value === '') {
      this.generateAllCharacters();
      return;
    }

    this.http.get<any>(this.URL2 + encodeURIComponent(value)).subscribe({
      next: (data) => {
        this.characters = data.results.map((char: any) => ({ ...char }));
      },
      error: () => {
        this.characters = [];
      }
    });
  }

  sortTable(sortBy: string) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.generateAllCharacters(sortBy);
  }

  loadLocation(character: any) {
    const id = character.id;
    this.http.get<any>(`https://rickandmortyapi.com/api/character/${id}`).subscribe(data => {
      const found = this.characters.find(c => c.id === id);
      if (found) {
        found.locationName = data.location?.name || '';
      }
    });
  }
}
