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
import { Feedback2Component } from '../feedback2/feedback2.component';

@Component({
  selector: 'app-chatbot2',
  standalone: true,
  imports: [CommonModule, FormsModule, Feedback2Component],
  templateUrl: './chatbot2.component.html',
  styleUrl: './chatbot2.component.scss',
})
export class Chatbot2Component {
  @Output() close = new EventEmitter<void>();
  @Input() chatbotEndpoint: string = environment.rasaEndpoint;
  @Input() userId: string = '';
  @Input() username: string = 'User';
  userMessage = '';
  isTyping = false;
  isChatOpen = true;
  email: string = '';
  isAuthenticated: boolean = false;
  lastName: string = '';
  agreedToPolicy: boolean = false;
  showFeedbackForm = false;
  selectedRating: number = 0;
  showChat: boolean = false;
  @Output() minimize = new EventEmitter<void>();
  chatStartTime: string = '';
  showbotFeedbackForm = false;
  showMenu: boolean = false;
  showConfirmationDialog = false;
  initialButtons: { title: string; payload: string }[] = [
    { title: 'A delivery, return or refund', payload: '/ask_help' },
    { title: 'Something else', payload: '/something_else' },
  ];
  isMinimized: boolean = false;
  messages: {
    text?: string;
    sender: string;
    image?: string;
    isButtonGroup?: boolean;
    buttons?: { title: string; payload: string }[];
  }[] = [];

  @ViewChild('chatBody') private chatBody!: ElementRef;
  ngOnInit(): void {
    this.showChat = true;
    this.isTyping = true;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    this.chatStartTime = formattedDate + ' at ' + formattedTime;
    fetch(this.chatbotEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: this.userId,
        message: 'hi',
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
        data.forEach((res: any, index: number) => {
          if (res.text && res.text.trim() !== '') {
            if (index === 0) {
              this.messages.push({
                sender: 'Bot',
                text: res.text,
              });
            } else {
              this.messages.push({
                sender: 'Bot',
                text: res.text,
              });
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
            this.messages.push({
              sender: 'Bot',
              image: res.image,
            });
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

    fetch(environment.rasaEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: this.userId, message: messageToSend }),
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

    fetch(environment.rasaEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: this.userId, message: payload }),
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
    // this.close.emit();
  }

  submitFeedback(): void {
    this.showFeedbackForm = false;
    this.showbotFeedbackForm = true;
    //  this.close.emit();
  }

  onFeedbackComplete(): void {
    this.isChatOpen = false;
    this.close.emit();
  }

  openMenu(): void {
    this.showMenu = !this.showMenu;
    console.log('Persistent menu button clicked.');
  }

  endChat(): void {
    this.closeChat();
  }

  confirmEndChat(): void {
    this.showMenu = !this.showMenu;
    this.showConfirmationDialog = true;
  }
  confirmEndChat1(): void {
    //this.showMenu = !this.showMenu;
    this.showConfirmationDialog = true;
  }
  endChatConfirmed(): void {
    this.showConfirmationDialog = false;
    this.showChat = false;
    this.showbotFeedbackForm = true;
  }

  cancelEndChat(): void {
    this.showConfirmationDialog = false;
  }

  menuOptions(): void {
    this.showMenu = false;
    this.messages.push({
      sender: 'Bot',
      isButtonGroup: true,
      buttons: this.initialButtons,
    });
  }

  minimizeChat(): void {
    this.minimize.emit();
    this.isMinimized = true;
  }

  restoreChat(): void {
    this.isMinimized = false;
  }
}
