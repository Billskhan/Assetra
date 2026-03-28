import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { decodeJwtPayload, mapJwtToUser } from './jwt.util';
import { AuthUser, JwtPayload, LoginRequest, LoginResponse } from './auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'assetra.token';

  token = signal<string | null>(null);
  currentUser = signal<AuthUser | null>(null);
  isAuthenticated = computed(() => !!this.token());

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest) {
    return this.http
      .post<LoginResponse>('/auth/login', credentials)
      .pipe(
        tap((response) => {
          if (response?.access_token) {
            this.setSession(response.access_token);
          } else {
            this.clearSession();
          }
        })
      );
  }

  logout(): void {
    this.clearSession();
  }

  restoreSession(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const token = localStorage.getItem(this.storageKey);
    if (token) {
      this.setSession(token);
    }
  }

  getToken(): string | null {
    return this.token();
  }

  private setSession(token: string): void {
    const payload = decodeJwtPayload<JwtPayload>(token);
    const user = mapJwtToUser(payload);

    if (!payload || !user) {
      this.clearSession();
      return;
    }

    if (payload.exp && Date.now() / 1000 >= payload.exp) {
      this.clearSession();
      return;
    }

    this.token.set(token);
    this.currentUser.set(user);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, token);
    }
  }

  private clearSession(): void {
    this.token.set(null);
    this.currentUser.set(null);

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }
}
