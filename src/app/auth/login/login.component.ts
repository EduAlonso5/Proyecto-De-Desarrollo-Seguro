import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,        // Necesario para *ngIf
    ReactiveFormsModule, // Necesario para formGroup
    RouterModule         // Necesario para routerLink
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  loading = false;
  error: string | null = null;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(15)]],
      password: ['', [Validators.required, Validators.maxLength(10), Validators.pattern('^[a-zA-Z0-9]{10}$')]]
    });
  }

  onSubmit() {
    this.submitted = true;
    
    if (this.loginForm.valid) {
      this.loading = true;
      console.log('Login data:', this.loginForm.value);
      // Aquí iría tu lógica de inicio de sesión
      this.loading = false;
    }
  }
}