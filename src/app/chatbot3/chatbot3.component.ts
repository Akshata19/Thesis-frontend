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

interface ChatMessage {
  text?: string;
  sender: string;
  image?: string;
  isButtonGroup?: boolean;
  buttons?: { title: string; payload: string }[];
  time?: string;
}

@Component({
  selector: 'app-chatbot3',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot3.component.html',
  styleUrl: './chatbot3.component.scss',
})
export class Chatbot3Component {
  @Output() close = new EventEmitter<void>();
  @Input() chatbotEndpoint: string =
    'http://localhost:5005/webhooks/rest/webhook';
  @Input() username: string = 'User';
  userMessage = '';
  isTyping = false;
  isChatOpen = true;
  showMenu: boolean = false;
  isMinimized: boolean = false;
  showConfirmationDialog = false; // Controls whether the "Are you sure?" dialog is displayed

  initialButtons: { title: string; payload: string }[] = [
    { title: 'A delivery, return or refund', payload: '/ask_help' },
    { title: 'Something else', payload: '/something_else' },
  ];

  messages: ChatMessage[] = [];

  @ViewChild('chatBody') private chatBody!: ElementRef;

  ngOnInit(): void {
    this.isTyping = true;

    fetch(this.chatbotEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: 'user',
        message: 'Hello from second bot',
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
                text: `Hello ${this.username}, ${res.text}`,
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
    this.closeChat();
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
}
