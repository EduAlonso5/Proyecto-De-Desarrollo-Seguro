import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  submitted = false;
  loading = false;
  error: string | null = null;
loginForm: any;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(15)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.maxLength(10), Validators.pattern('^[a-zA-Z0-9]{10}$')]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit() {
    this.submitted = true;
    
    if (this.registerForm.valid) {
      this.loading = true;
      console.log('Register data:', this.registerForm.value);
      // Aquí iría tu lógica de registro
      this.loading = false;
    }
  }
}