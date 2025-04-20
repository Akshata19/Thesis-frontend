import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage(); // Load user on init
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, {
      username,
      email,
      password,
    });
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        // Save the full user + token in localStorage
        map((response: any) => {
          if (response && response.user && response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            this.userSubject.next(response.user);
          }

          return response;
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  setUser(user: any): void {
    this.userSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  loadUserFromStorage(): void {
    if (typeof window !== 'undefined' && localStorage.getItem('currentUser')) {
      try {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.userSubject.next(user);
      } catch (err) {
        console.error('Error parsing user from storage:', err);
        localStorage.removeItem('currentUser'); // Clean invalid data
        this.userSubject.next(null);
      }
    } else {
      this.userSubject.next(null);
    }
  }

  verifyToken(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.http
        .get<any>(`${this.apiUrl}/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .subscribe(
          (res) => {
            this.userSubject.next(res.user);
            localStorage.setItem('currentUser', JSON.stringify(res.user));
          },
          () => {
            this.userSubject.next(null);
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
          }
        );
    }
  }

  get currentUser(): any {
    return this.userSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }
}
