import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// ADD LINE COD ETO COMMIT
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('front-order-request');
}
