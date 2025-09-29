import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any | null>;
  public currentUser: Observable<any | null>;
  private apiUrl = 'http://localhost:3000/'; // Cambia por tu URL
  error: any;

  constructor(
    @Inject(HttpClient) private http: HttpClient, 
    @Inject(Router) private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<any | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    return localStorage.getItem('access_token');
  }

  login(username: string, password: string): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/auth/login`, { 
    username, 
    password 
  }).pipe(
    map(response => {
      if (response && response.token) {
        localStorage.setItem('access_token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      }
      return response;
    }),
    catchError(error => {
      this.error = error.error?.message || 'Error de conexión';
      return throwError(() => error);
    })
  );
}

register(userData: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/auth/register`, userData)
    .pipe(
      map(response => {
        if (response && response.token) {
          localStorage.setItem('access_token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
        return response;
      }),
      catchError(error => {
        this.error = error.error?.message || 'Error de registro';
        return throwError(() => error);
      })
    );
}

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = this.token;
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch (e) {
      return false;
    }
  }
}