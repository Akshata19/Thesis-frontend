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
import { Feedback5Component } from '../feedback5/feedback5.component';

@Component({
  selector: 'app-chatbot5',
  standalone: true,
  imports: [CommonModule, FormsModule, Feedback5Component],
  templateUrl: './chatbot5.component.html',
  styleUrl: './chatbot5.component.scss',
})
export class Chatbot5Component {
  @Output() close = new EventEmitter<void>();
  @Input() chatbotEndpoint: string =
    'http://localhost:5005/webhooks/rest/webhook';
  @Input() userId: string = '';

  userMessage = '';
  isTyping = false;
  isChatOpen = true;
  latestButtons: { title: string; payload: string }[] = [];
  showMenu: boolean = false;
  @ViewChild('chatBody') private chatBody!: ElementRef;
  isMinimized: boolean = false;
  isLeftMenuOpen: boolean = false;
  showConfirmationDialog = false;
  @Output() minimize = new EventEmitter<void>();
  showClose: boolean = false;
  showFeedbackForm = false;
  showChat = false;
  initialButtons: { title: string; payload: string }[] = [
    { title: 'A delivery, return or refund', payload: '/ask_help' },
    { title: 'Something else', payload: '/something_else' },
  ];
  messages: {
    text?: string;
    sender: string;
    image?: string;
    isButtonGroup?: boolean;
    buttons?: { title: string; payload: string }[];
    time?: string;
  }[] = [];
  chatStartTime: string = '';
  isChatEnded: boolean = false;
  chatEndTime: string = '';

  ngOnInit(): void {
    this.isTyping = true;
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.chatStartTime = `${hours}:${minutes}`;
    this.showChat = true;

    this.sendBotMessage('hi');
  }
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.chatBody.nativeElement.scrollTop =
        this.chatBody.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll to bottom failed:', err);
    }
  }
  openMenu(): void {
    this.showMenu = !this.showMenu;
    console.log('Persistent menu button clicked.');
  }
  menuOptions(): void {
    this.showMenu = false;
    this.messages.push({
      sender: 'Bot',
      isButtonGroup: true,
      buttons: this.initialButtons,
    });
    this.latestButtons = this.initialButtons;
  }

  sendBotMessage(message: string): void {
    fetch(this.chatbotEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: this.userId, message }),
    })
      .then((response) => response.json())
      .then((data) => {
        this.isTyping = false;

        let lastButtons: { title: string; payload: string }[] = [];

        data.forEach((res: any) => {
          if (res.text?.trim()) {
            this.messages.push({ sender: 'Bot', text: res.text });
          }

          if (res.image) {
            this.messages.push({ sender: 'Bot', image: res.image });
          }

          if (res.buttons?.length > 0) {
            this.messages.push({
              sender: 'Bot',
              isButtonGroup: true,
              buttons: res.buttons,
            });
            lastButtons = res.buttons; // capture latest buttons
          }
        });

        // After loop ends, update latestButtons once
        this.latestButtons = lastButtons;
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

  sendMessage(): void {
    if (this.userMessage.trim() === '') return;

    const messageToSend = this.userMessage;
    this.messages.push({ sender: 'You', text: messageToSend });
    this.latestButtons = [];
    this.userMessage = '';
    this.isTyping = true;

    this.sendBotMessage(messageToSend);
  }

  handleButtonClick(payload: string, title: string): void {
    this.latestButtons = [];
    this.messages.push({ sender: 'You', text: title });
    this.isTyping = true;

    this.sendBotMessage(payload);
  }

  closeChat(): void {
    this.showChat = false;
    this.showFeedbackForm = !this.showFeedbackForm;
  }

  downloadTranscript(): void {
    const chatData = this.messages
      .map((msg) => {
        return `${msg.sender}: ${msg.text}`;
      })
      .join('\n');

    const blob = new Blob([chatData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-transcript.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      console.log('Selected file:', file);
      // Optional: send to backend, preview, etc.
    }
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }

  toggleLeftMenu(): void {
    this.isLeftMenuOpen = !this.isLeftMenuOpen;
  }

  handleMainMenu(): void {
    this.isLeftMenuOpen = false;
    this.menuOptions();
  }

  handleCloseChat(): void {
    this.isLeftMenuOpen = false;
    this.closeChat();
  }

  confirmEndChat(): void {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.chatEndTime = `${hours}:${minutes}`;
    this.isChatEnded = true;
    this.showClose = true;
    this.showMenu = false;
    this.latestButtons = [];
  }

  onFeedbackComplete(): void {
    this.isChatOpen = false; // now window can close after thank you
    this.close.emit();
  }
}
