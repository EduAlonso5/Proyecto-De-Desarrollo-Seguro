import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 Importar FormsModule
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], // 👈 Agregar FormsModule aquí
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.ts']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService) {}

  onLogin() {
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        console.log('✅ Login exitoso:', res);
        if (res.token) {
          this.authService.saveToken(res.token);
        }
      },
      error: (err) => {
        console.error('❌ Error en login:', err);
      }
    });
  }
}
