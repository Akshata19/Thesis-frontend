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
import { FeedbackFormComponent } from '../feedback-form/feedback-form.component';
import { ConsentComponent } from '../consent/consent.component';

@Component({
  selector: 'app-chattbot',
  standalone: true,
  imports: [CommonModule, FormsModule, FeedbackFormComponent, ConsentComponent],
  templateUrl: './chattbot.component.html',
  styleUrl: './chattbot.component.scss',
})
export class ChattbotComponent {
  @Output() minimize = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Input() chatbotEndpoint: string = environment.rasaEndpoint;
  @Input() userId: string = '';
  showConsentDialog = true;
  isMinimized: boolean = false;
  userMessage = '';
  isTyping = false;
  isChatOpen = true;
  currentDay: Date = new Date();
  showChat = false;
  showFeedbackForm = false;
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
    this.sendToRasa('hi'); // Begin conversation after consent
  }
  onConsentAccepted(): void {
    this.showConsentDialog = false;
    this.showChat = true;
    this.sendToRasa('hi'); // Begin conversation after consent
  }
  ngAfterViewChecked() {
    this.scrollToBottom();
  }
  sendMessage(): void {
    if (this.userMessage.trim() === '') return;

    const messageToSend = this.userMessage;
    this.messages.push({ sender: 'You', text: messageToSend });
    this.userMessage = '';
    this.isTyping = true;

    this.sendToRasa(messageToSend);
  }

  handleButtonClick(payload: string, title: string): void {
    this.messages.push({ sender: 'You', text: title });
    this.isTyping = true;
    this.sendToRasa(payload);
  }

  private sendToRasa(message: string): void {
    fetch(this.chatbotEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: this.userId || 'guest', // ✅ Send actual userId or fallback
        message,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setTimeout(() => {
          this.isTyping = false;

          if (data.length === 0) {
            this.messages.push({
              sender: 'Bot',
              text: "Sorry, I didn't understand that.",
            });
            return;
          }

          data.forEach((res: any) => {
            if (res.text?.trim()) {
              this.messages.push({ sender: 'Bot', text: res.text });
            }

            if (res.buttons?.length) {
              this.messages.push({
                sender: 'Bot',
                isButtonGroup: true,
                buttons: res.buttons,
              });
            }

            if (res.image) {
              this.messages.push({ sender: 'Bot', image: res.image });
            }
            this.scrollToBottom();
          });
        }, 1500);
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
    //this.close.emit();
    this.showChat = false;
    this.showFeedbackForm = !this.showFeedbackForm;
  }

  onFeedbackComplete(): void {
    this.isChatOpen = false; // now window can close after thank you
    this.close.emit();
  }

  minimizeChat(): void {
    this.minimize.emit();
    this.isMinimized = true;
  }

  restoreChat(): void {
    this.isMinimized = false;
  }

  private scrollToBottom(): void {
    try {
      this.chatBody.nativeElement.scrollTop =
        this.chatBody.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll to bottom failed:', err);
    }
  }
}
