import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FavoritesService } from '../../services/favorites.service';
import { Character } from '../../models/character.model';

@Component({
  selector: 'app-character-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './character-table.component.html',
  styleUrls: ['./character-table.component.css']
})
export class CharacterTableComponent implements OnInit {
  // URLs de la API
  private readonly API_URL = 'https://rickandmortyapi.com/api/character';
  private readonly API_SEARCH_URL = 'https://rickandmortyapi.com/api/character/?name=';

  // Estado del componente
  characters: Character[] = [];
  filteredCharacters: Character[] | null = null; // Cambiado a null inicial
  sortDirection: 'asc' | 'desc' = 'asc';
  showNotesInputId: number | null = null;
  notesText: string = '';
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private http: HttpClient,
    private favoritesService: FavoritesService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCharacters();
  }

  // Carga inicial de personajes
  loadCharacters(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.filteredCharacters = null;
    
    this.http.get<{results: Character[]}>(this.API_URL).subscribe({
      next: (response) => {
        this.characters = response.results.map(char => ({
          ...this.enrichCharacterData(char),
          imageLoaded: false
        }));
        this.filteredCharacters = [...this.characters];
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar personajes. Por favor, intenta nuevamente.';
        this.isLoading = false;
        this.filteredCharacters = [];
        this.cdRef.detectChanges();
        console.error('API Error:', err);
      }
    });
  }

  // Búsqueda de personajes
  searchCharacters(searchTerm: string): void {
    const term = searchTerm.trim();
    
    if (!term) {
      this.filteredCharacters = [...this.characters];
      return;
    }

    this.isLoading = true;
    this.http.get<{results: Character[]}>(`${this.API_SEARCH_URL}${encodeURIComponent(term)}`).subscribe({
      next: (response) => {
        this.filteredCharacters = response.results.map(char => ({
          ...this.enrichCharacterData(char),
          imageLoaded: false
        }));
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.filteredCharacters = [];
        this.isLoading = false;
        this.cdRef.detectChanges();
      }
    });
  }

  // Enriquecer datos del personaje
  private enrichCharacterData(character: Character): Character {
    return {
      ...character,
      isFavorite: this.favoritesService.isFavorite(character.id),
      notes: this.getFavoriteNotes(character.id),
      locationName: character.location?.name || 'Desconocido'
    };
  }

  // Manejo de imágenes
  handleImageLoad(character: Character): void {
    character.imageLoaded = true;
    this.cdRef.detectChanges();
  }

  handleImageError(event: Event, character: Character): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/default-character.png';
    character.imageLoaded = true;
    this.cdRef.detectChanges();
  }

  // Métodos para favoritos
  toggleFavorite(character: Character): void {
    if (this.favoritesService.isFavorite(character.id)) {
      this.favoritesService.removeFavorite(character.id);
    } else {
      this.favoritesService.addFavorite(character, this.notesText);
    }
    this.updateCharacterInList(character.id);
  }

  private updateCharacterInList(id: number): void {
    if (!this.filteredCharacters) return;
    
    const index = this.filteredCharacters.findIndex(c => c.id === id);
    if (index !== -1) {
      this.filteredCharacters[index] = this.enrichCharacterData(this.filteredCharacters[index]);
      this.cdRef.detectChanges();
    }
  }

  // Manejo de notas
  getFavoriteNotes(id: number): string {
    const favorite = this.favoritesService.getFavorite(id);
    return favorite?.notes || '';
  }

  startEditingNotes(character: Character): void {
    this.showNotesInputId = character.id;
    this.notesText = this.getFavoriteNotes(character.id);
  }

  saveNotes(character: Character): void {
    if (this.notesText.trim()) {
      this.favoritesService.updateFavoriteNotes(character.id, this.notesText);
      this.updateCharacterInList(character.id);
    }
    this.cancelEditing();
  }

  cancelEditing(): void {
    this.showNotesInputId = null;
    this.notesText = '';
  }

  // Ordenación
  sortTable(sortBy: keyof Character): void {
    if (!this.filteredCharacters) return;
    
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    
    this.filteredCharacters.sort((a, b) => {
      const aValue = a[sortBy] ?? '';
      const bValue = b[sortBy] ?? '';
      return this.sortDirection === 'asc' 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }

  // Carga de ubicación
  loadLocation(character: Character): void {
    if (!character.locationName || character.locationName === 'Desconocido') {
      this.http.get<Character>(`${this.API_URL}/${character.id}`).subscribe({
        next: (data) => {
          if (this.filteredCharacters) {
            const foundChar = this.filteredCharacters.find(c => c.id === character.id);
            if (foundChar) {
              foundChar.locationName = data.location?.name || 'Desconocido';
              this.cdRef.detectChanges();
            }
          }
        }
      });
    }
  }
}