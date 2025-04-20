import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chattbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chattbot.component.html',
  styleUrl: './chattbot.component.scss'
})
export class ChattbotComponent {
  @Output() close = new EventEmitter<void>();
  @Input() chatbotEndpoint: string = 'http://localhost:5005/webhooks/rest/webhook'; 
  userMessage = '';
  isTyping = false;
  isChatOpen = true;

  messages: {
    text?: string;
    sender: string;
    image?: string;
    isButtonGroup?: boolean;
    buttons?: { title: string; payload: string }[];
  }[] = [];
  ngOnInit(): void {
    // Simulate user "greet" intent to start the conversation
    fetch(this.chatbotEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: 'user', message: 'hi' }) // triggers greet intent
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.length === 0) {
          this.messages.push({ sender: 'Bot', text: "Hi! How can I help you today?" });
          return;
        }
  
        data.forEach((res: any) => {
          if (res.text && res.text.trim() !== '') {
            this.messages.push({ sender: 'Bot', text: res.text });
          }
  
          if (res.buttons && res.buttons.length > 0) {
            this.messages.push({
              sender: 'Bot',
              isButtonGroup: true,
              buttons: res.buttons
            });
          }
  
          if (res.image) {
            this.messages.push({ sender: 'Bot', image: res.image });
          }
        });
      })
      .catch((error) => {
        console.error('Initial greet error:', error);
        this.messages.push({ sender: 'Bot', text: 'Something went wrong starting the chat.' });
      });
  }
  sendMessage(): void {
    if (this.userMessage.trim() === '') return;
  
    const messageToSend = this.userMessage;
    this.messages.push({ sender: 'You', text: messageToSend });
    this.userMessage = '';
    this.isTyping = true;
  
    fetch('http://localhost:5005/webhooks/rest/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: 'user', message: messageToSend }),
    })
      .then((response) => response.json())
      .then((data) => {
        this.isTyping = false;
  
        if (data.length === 0) {
          this.messages.push({ sender: 'Bot', text: "Sorry, I didn't get that." });
          return;
        }
  
        data.forEach((res: any) => {
          if (res.text && res.text.trim() !== '') {
            this.messages.push({ sender: 'Bot', text: res.text });
          }
          
          if (res.buttons && res.buttons.length > 0) {
            this.messages.push({
              sender: 'Bot',
              isButtonGroup: true,
              buttons: res.buttons
            });
          }
  
          if (res.image) {
            this.messages.push({ sender: 'Bot', image: res.image });
          }

        });
      })
      .catch((error) => {
        this.isTyping = false;
        console.error('Error:', error);
        this.messages.push({ sender: 'Bot', text: 'Something went wrong. Please try again later.' });
      });
  }
  
  handleButtonClick(payload: string, title: string): void {
    // Display the button text (title) as user's message
    this.messages.push({ sender: 'You', text: title });
  
    this.isTyping = true;
  
    fetch('http://localhost:5005/webhooks/rest/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: 'user', message: payload }),
    })
      .then((response) => response.json())
      .then((data) => {
        this.isTyping = false;
  
        if (data.length === 0) {
          this.messages.push({ sender: 'Bot', text: "Sorry, I didn't get that." });
          return;
        }
  
        data.forEach((res: any) => {
          if (res.text && res.text.trim() !== '') {
            this.messages.push({ sender: 'Bot', text: res.text });
          }
  
          if (res.buttons && res.buttons.length > 0) {
            this.messages.push({
              sender: 'Bot',
              isButtonGroup: true,
              buttons: res.buttons
            });
          }
  
          if (res.image) {
            this.messages.push({ sender: 'Bot', image: res.image });
          }
        });
      })
      .catch((error) => {
        this.isTyping = false;
        console.error('Error:', error);
        this.messages.push({ sender: 'Bot', text: 'Something went wrong. Please try again later.' });
      });
  }
  
  closeChat(): void {
    this.close.emit();
  }
}
