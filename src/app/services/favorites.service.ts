// src/app/services/favorites.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Character } from '../models/character.model';

export interface FavoriteCharacter extends Character {
id: any;
species: any;
status: any;
name: any;
image: any;
  notes?: string;
  addedDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'rickAndMortyFavorites';
  private favoritesSubject: BehaviorSubject<FavoriteCharacter[]>;

  constructor() {
    const savedFavorites = this.getFromLocalStorage();
    this.favoritesSubject = new BehaviorSubject<FavoriteCharacter[]>(savedFavorites);
  }

  getFavorites(): Observable<FavoriteCharacter[]> {
    return this.favoritesSubject.asObservable();
  }

  addFavorite(character: Character, notes?: string): void {
    const currentFavorites = this.favoritesSubject.value;
    
    if (this.isFavorite(character.id)) {
      return;
    }

    const newFavorite: FavoriteCharacter = {
      ...character,
      notes: notes || '',
      addedDate: new Date()
    };

    const updatedFavorites = [...currentFavorites, newFavorite];
    this.saveToLocalStorage(updatedFavorites);
    this.favoritesSubject.next(updatedFavorites);
  }

  removeFavorite(id: number): void {
    const updatedFavorites = this.favoritesSubject.value.filter(
      favorite => favorite.id !== id
    );
    this.saveToLocalStorage(updatedFavorites);
    this.favoritesSubject.next(updatedFavorites);
  }

  updateFavoriteNotes(id: number, notes: string): void {
    const updatedFavorites = this.favoritesSubject.value.map(favorite => {
      if (favorite.id === id) {
        return { ...favorite, notes };
      }
      return favorite;
    });

    this.saveToLocalStorage(updatedFavorites);
    this.favoritesSubject.next(updatedFavorites);
  }

  isFavorite(id: number): boolean {
    return this.favoritesSubject.value.some(favorite => favorite.id === id);
  }

  getFavorite(id: number): FavoriteCharacter | undefined {
    return this.favoritesSubject.value.find(favorite => favorite.id === id);
  }

  private saveToLocalStorage(favorites: FavoriteCharacter[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage', error);
    }
  }

  private getFromLocalStorage(): FavoriteCharacter[] {
    try {
      const favoritesJson = localStorage.getItem(this.STORAGE_KEY);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('Error reading favorites from localStorage', error);
      return [];
    }
  }
}