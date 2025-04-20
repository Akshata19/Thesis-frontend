import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environment/environment';

@Component({
  selector: 'app-chatbot2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot2.component.html',
  styleUrl: './chatbot2.component.scss',
})
export class Chatbot2Component {
  @Output() close = new EventEmitter<void>();
  @Input() chatbotEndpoint: string = environment.rasaEndpoint;

  userMessage = '';
  isTyping = false;
  isChatOpen = true;
  username: string = '';
  email: string = '';
  isAuthenticated: boolean = false;
  lastName: string = '';
  agreedToPolicy: boolean = false;

  messages: {
    text?: string;
    sender: string;
    image?: string;
    isButtonGroup?: boolean;
    buttons?: { title: string; payload: string }[];
  }[] = [];

  @ViewChild('chatBody') private chatBody!: ElementRef;
  startChat(): void {
    if (!this.username || !this.email) return;

    this.isAuthenticated = true;
    this.isTyping = true;

    const senderId = `${this.username}-${this.email}`;

    fetch(this.chatbotEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: senderId,
        message: 'Hello from second bot',
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.length === 0) {
          this.messages.push({
            sender: 'Bot',
            text: 'Something went wrong starting the chat.',
          });
          setTimeout(() => {
            this.isTyping = false;
          }, 50);
          return;
        }
        // Process each Rasa response
        data.forEach((res: any, index: number) => {
          if (res.text && res.text.trim() !== '') {
            if (index === 0) {
              // Append the username to the first message
              this.messages.push({
                sender: 'Bot',
                text: `Hello ${this.username}, ${res.text}`,
              });
            } else {
              this.messages.push({ sender: 'Bot', text: res.text });
            }
          }
          if (res.buttons && res.buttons.length > 0) {
            this.messages.push({
              sender: 'Bot',
              isButtonGroup: true,
              buttons: res.buttons,
            });
          }
          if (res.image) {
            this.messages.push({ sender: 'Bot', image: res.image });
          }
        });

        setTimeout(() => {
          this.isTyping = false;
        }, 50);
      })
      .catch((error) => {
        console.error('Initial greet error:', error);
        this.isTyping = false;
        this.messages.push({
          sender: 'Bot',
          text: 'Something went wrong starting the chat.',
        });
      });
  }

  ngOnInit(): void {
    this.isTyping = true;
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  // Helper method to scroll the chat container to the bottom.
  private scrollToBottom(): void {
    try {
      this.chatBody.nativeElement.scrollTop =
        this.chatBody.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll to bottom failed:', err);
    }
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
        if (data.length === 0) {
          this.messages.push({
            sender: 'Bot',
            text: "Sorry, I didn't get that.",
          });
          // Turn off the typing indicator after pushing the message
          setTimeout(() => {
            this.isTyping = false;
          }, 50);
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
              buttons: res.buttons,
            });
          }
          if (res.image) {
            this.messages.push({ sender: 'Bot', image: res.image });
          }
        });
        // Use a brief delay to ensure the messages have rendered before hiding the typing indicator.
        setTimeout(() => {
          this.isTyping = false;
        }, 50);
      })
      .catch((error) => {
        this.isTyping = false;
        console.error('Error:', error);
        this.messages.push({
          sender: 'Bot',
          text: 'Something went wrong. Please try again later.',
        });
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
          this.messages.push({
            sender: 'Bot',
            text: "Sorry, I didn't get that.",
          });
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
              buttons: res.buttons,
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
        this.messages.push({
          sender: 'Bot',
          text: 'Something went wrong. Please try again later.',
        });
      });
  }

  closeChat(): void {
    this.close.emit();
  }
}
