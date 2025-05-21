import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        console.log('NavigationStart to:', event.url);
      }
      if (event instanceof NavigationEnd) {
        console.log('NavigationEnd to:', event.url);
      }
      if (event instanceof NavigationCancel) {
        console.warn('NavigationCancel:', event.url);
      }
      if (event instanceof NavigationError) {
        console.error('NavigationError:', event.error);
      }
    });
  }
}
