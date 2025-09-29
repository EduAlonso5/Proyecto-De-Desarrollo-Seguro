import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,  // ✅ Si usas componentes standalone
  imports: [RouterOutlet],  // ✅ Solo RouterOutlet necesario
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'PrimerProyecto';
}