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
import { Feedback4Component } from '../feedback4/feedback4.component';
interface ChatMessage {
  text?: string;
  sender: string;
  image?: string;
  isButtonGroup?: boolean;
  buttons?: { title: string; payload: string }[];
  time?: string;
}

@Component({
  selector: 'app-chatbot4',
  standalone: true,
  imports: [CommonModule, FormsModule, Feedback4Component],
  templateUrl: './chatbot4.component.html',
  styleUrl: './chatbot4.component.scss',
})
export class Chatbot4Component {
  @Output() close = new EventEmitter<void>();
  @Input() chatbotEndpoint: string = environment.rasaEndpoint;
  @Input() username: string = 'User';
  @Output() minimize = new EventEmitter<void>();
  @Input() userId: string = '';

  userMessage = '';
  isTyping = false;
  isChatOpen = true;
  showMenu: boolean = false;
  isMinimized: boolean = false;
  showConfirmationDialog = false; // Controls whether the "Are you sure?" dialog is displayed
  showFeedbackDialog: boolean = false;
  feedbackRating: number = 0;

  showFeedbackForm = false;
  showChat = false;
  setRating(rating: number): void {
    this.feedbackRating = rating;
  }

  submitFeedback(): void {
    console.log('User feedback rating:', this.feedbackRating);
    this.showFeedbackDialog = false;
    this.showChat = false;
    this.showFeedbackForm = true;
    //this.closeChat(); // Close the chat
  }

  initialButtons: { title: string; payload: string }[] = [
    { title: 'A delivery, return or refund', payload: '/ask_help' },
    { title: 'Something else', payload: '/something_else' },
  ];

  messages: ChatMessage[] = [];

  @ViewChild('chatBody') private chatBody!: ElementRef;

  ngOnInit(): void {
    this.isTyping = true;
    this.showChat = true;

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
            time: this.getCurrentTime(),
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
                time: this.getCurrentTime(),
              });
            } else {
              this.messages.push({
                sender: 'Bot',
                text: res.text,
                time: this.getCurrentTime(),
              });
            }
          }
          if (res.buttons && res.buttons.length > 0) {
            this.messages.push({
              sender: 'Bot',
              isButtonGroup: true,
              buttons: res.buttons,
              time: this.getCurrentTime(),
            });
          }
          if (res.image) {
            this.messages.push({
              sender: 'Bot',
              image: res.image,
              time: this.getCurrentTime(),
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
          time: this.getCurrentTime(),
        });
      });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }
  private getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
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
    this.messages.push({
      sender: 'You',
      text: messageToSend,
      time: this.getCurrentTime(),
    });
    this.userMessage = '';
    this.isTyping = true;

    fetch(this.chatbotEndpoint, {
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
            time: this.getCurrentTime(),
          });
          // Turn off the typing indicator after pushing the message
          setTimeout(() => {
            this.isTyping = false;
          }, 50);
          return;
        }
        data.forEach((res: any) => {
          if (res.text && res.text.trim() !== '') {
            this.messages.push({
              sender: 'Bot',
              text: res.text,
              time: this.getCurrentTime(),
            });
          }
          if (res.buttons && res.buttons.length > 0) {
            this.messages.push({
              sender: 'Bot',
              isButtonGroup: true,
              buttons: res.buttons,
              time: this.getCurrentTime(),
            });
          }
          if (res.image) {
            this.messages.push({
              sender: 'Bot',
              image: res.image,
              time: this.getCurrentTime(),
            });
          }
        });
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
          time: this.getCurrentTime(),
        });
      });
  }

  handleButtonClick(payload: string, title: string): void {
    this.messages = this.messages.filter((message) => !message.isButtonGroup);

    this.messages.push({
      sender: 'You',
      text: title,
      time: this.getCurrentTime(),
    });

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
            time: this.getCurrentTime(),
          });
          return;
        }

        data.forEach((res: any) => {
          if (res.text && res.text.trim() !== '') {
            this.messages.push({
              sender: 'Bot',
              text: res.text,
              time: this.getCurrentTime(),
            });
          }

          if (res.buttons && res.buttons.length > 0) {
            this.messages.push({
              sender: 'Bot',
              isButtonGroup: true,
              buttons: res.buttons,
              time: this.getCurrentTime(),
            });
          }

          if (res.image) {
            this.messages.push({
              sender: 'Bot',
              image: res.image,
              time: this.getCurrentTime(),
            });
          }
        });
      })
      .catch((error) => {
        this.isTyping = false;
        console.error('Error:', error);
        this.messages.push({
          sender: 'Bot',
          text: 'Something went wrong. Please try again later.',
          time: this.getCurrentTime(),
        });
      });
  }

  closeChat(): void {
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
    this.showConfirmationDialog = true;
  }

  endChatConfirmed(): void {
    this.showConfirmationDialog = false;
    this.showFeedbackDialog = true;
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
      time: this.getCurrentTime(),
    });
  }

  handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      console.log('Selected file:', file);
      // Optional: send to backend, preview, etc.
    }
  }

  minimizeChat(): void {
    this.minimize.emit();
    this.isMinimized = true;
  }

  restoreChat(): void {
    this.isMinimized = false;
  }

  onFeedbackComplete(): void {
    this.isChatOpen = false; // now window can close after thank you
    this.close.emit();
  }
}
