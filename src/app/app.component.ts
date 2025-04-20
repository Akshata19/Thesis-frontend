import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { ChattbotComponent } from './chattbot/chattbot.component';
import { Chatbot2Component } from './chatbot2/chatbot2.component';
import { AuthService } from './services/auth.service';
import { Chatbot3Component } from './chatbot3/chatbot3.component';
import { Chatbot4Component } from './chatbot4/chatbot4.component';
import { Chatbot5Component } from './chatbot5/chatbot5.component';
import { environment } from '../environment/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    ChattbotComponent,
    Chatbot2Component,
    Chatbot3Component,
    Chatbot4Component,
    Chatbot5Component,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  username: string = '';
  title = 'ecommerce-frontend';
  isCollapsed = true;
  isMinimized: boolean = false;
  chatbotEndpont = environment.rasaEndpoint;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user: string | null) => {
      if (user) {
        this.username = user;
      }
    });
  }
  collapse() {
    this.isCollapsed = true;
  }

  closeDropdown(dropdown: any) {
    dropdown.close();
  }
  chatVisible: boolean = false;
  chatVisible1: boolean = false;
  chatVisible3: boolean = false;
  chatVisible4: boolean = false;
  chatVisible5: boolean = false;
  /*openChat(): void {
    this.closeAllChats();
    this.chatVisible = true;
  } */

  openChat1(): void {
    this.closeAllChats();
    this.chatVisible1 = true;
  }

  openChat3(): void {
    this.closeAllChats();
    this.chatVisible3 = true;
  }

  openChat4(): void {
    this.closeAllChats();
    this.chatVisible4 = true;
  }

  openChat5(): void {
    this.closeAllChats();
    this.chatVisible5 = true;
  }

  closeChat(): void {
    this.chatVisible = false;
  }
  closeChat1(): void {
    this.chatVisible1 = false;
  }
  closeChat3(): void {
    this.chatVisible3 = false;
  }
  closeChat4(): void {
    this.chatVisible4 = false;
  }
  closeChat5(): void {
    this.chatVisible5 = false;
  }
  closeAllChats(): void {
    this.chatVisible = false;
    this.chatVisible1 = false;
    this.chatVisible3 = false;
    this.chatVisible4 = false;
    this.chatVisible5 = false;
  }

  chatOptionsVisible = false;

  toggleChatOptions(): void {
    this.chatOptionsVisible = !this.chatOptionsVisible;
  }

  openChat(option: number): void {
    this.closeAllChats();
    this.isMinimized = false;

    switch (option) {
      case 1:
        this.chatVisible = true;
        break;
      case 2:
        this.chatVisible1 = true;
        break;
      case 3:
        this.chatVisible3 = true;
        break;
      case 4:
        this.chatVisible4 = true;
        break;
      case 5:
        this.chatVisible5 = true;
        break;
    }

    this.chatOptionsVisible = false; // Hide options after selection
  }

  isAnyChatbotOpen(): boolean {
    return (
      this.chatVisible ||
      this.chatVisible1 ||
      this.chatVisible3 ||
      this.chatVisible4 ||
      this.chatVisible5
    );
  }

  handleMinimize(): void {
    this.closeAllChats();
    this.isMinimized = true;
  }
}
