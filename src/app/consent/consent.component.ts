import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-consent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consent.component.html',
  styleUrl: './consent.component.scss',
})
export class ConsentComponent {
  @Input() chatbotVersion = 'Chatbot 1';
  @Output() accepted = new EventEmitter<void>();

  get observedPatterns(): string[] {
    switch (this.chatbotVersion) {
      case 'Chatbot 1':
        return [
          'Chat message design with rounded corners',
          'Quick reply options integrated directly below messages',
          'Animated typing indicator (three dots) that mimics human response time',
          'Date and time display at the beginning of the chat to provide context',
          'Conversation ends by fully closing the chat window, resetting the session',
        ];
      case 'Chatbot 2':
        return [
          ' Square chat bubbles with flat corners',
          'Vertical quick reply layout',
          'Text-based typing indicator',
          'Session minimization with chevron icon',
          'Feedback prompt at chat end',
        ];
      // Add more cases for other versions
      default:
        return ['Observe the design elements carefully.'];
    }
  }

  onAccept(): void {
    this.accepted.emit();
  }
}
