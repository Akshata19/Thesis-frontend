import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-feedback-form',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './feedback-form.component.html',
  styleUrl: './feedback-form.component.scss',
})
export class FeedbackFormComponent {
  feedbackForm: FormGroup;
  chatbotVersion = 'Chatbot 1'; // dynamically update this per chatbot session
  submitted = false;

  @Output() feedbackComplete = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.feedbackForm = this.fb.group({
      name: ['', Validators.required],
      age: [null, Validators.required],
      gender: ['', Validators.required],
      occupation: [''],

      chatbotVersion: [this.chatbotVersion],
      chatMessage: [null, Validators.required],
      quickReply: [null, Validators.required],
      typingIndicator: [null, Validators.required],
      persistentMenu: [null],
      informationStamp: [null],
      sessionMinimization: [null],
      conversationClosure: [null, Validators.required],
      comments: [''],
    });
  }

  onSubmit() {
    if (!this.feedbackForm.contains('persistentMenu'))
      this.feedbackForm.addControl('persistentMenu', this.fb.control(null));
    if (!this.feedbackForm.contains('sessionMinimization'))
      this.feedbackForm.addControl(
        'sessionMinimization',
        this.fb.control(null)
      );
    this.http
      .post('http://localhost:3000/api/feedback', this.feedbackForm.value)
      .subscribe({
        next: (res) => {
          this.feedbackForm.reset({ chatbotVersion: this.chatbotVersion });
          this.submitted = true;
          setTimeout(() => {
            this.feedbackComplete.emit(); // This will trigger parent to close the window
          }, 3000);
        },
        error: (err) => console.error('Submission error:', err),
      });
  }

  cancel(): void {
    this.feedbackComplete.emit(); // lets parent decide what happens next
  }
}
