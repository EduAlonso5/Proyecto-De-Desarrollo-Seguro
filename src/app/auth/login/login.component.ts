import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(15)]],
      password: ['', [Validators.required, Validators.maxLength(10), Validators.pattern('^[a-zA-Z0-9]{10}$')]]
    });
  }

  onSubmit() {
    this.submitted = true;
    this.error = null;
    
    if (this.loginForm.valid) {
      this.loading = true;
      
      this.authService.login(
        this.loginForm.value.username, 
        this.loginForm.value.password
      ).subscribe({
        next: (response) => {
          this.loading = false;
          this.router.navigate(['/dashboard']); // O la ruta que quieras
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Error en el inicio de sesión';
        }
      });
    }
  }
}