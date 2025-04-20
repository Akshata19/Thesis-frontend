import { Component } from '@angular/core';
import { CategoriesComponent } from '../categories/categories.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CategoriesComponent, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  openChatbot(botNumber: number): void {
    switch (botNumber) {
      case 1:
        document
          .querySelector('app-navbar')
          ?.dispatchEvent(new CustomEvent('helpClicked'));
        break;
      case 2:
        document
          .querySelector('app-navbar')
          ?.dispatchEvent(new CustomEvent('helpClicked1'));
        break;
      case 3:
        document
          .querySelector('app-navbar')
          ?.dispatchEvent(new CustomEvent('helpClicked3'));
        break;
      case 4:
        document
          .querySelector('app-navbar')
          ?.dispatchEvent(new CustomEvent('helpClicked4'));
        break;
      case 5:
        document
          .querySelector('app-navbar')
          ?.dispatchEvent(new CustomEvent('helpClicked5'));
        break;
    }
  }
}
