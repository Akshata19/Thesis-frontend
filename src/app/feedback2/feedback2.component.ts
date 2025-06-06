import { Component, EventEmitter, Output } from '@angular/core';
import { environment } from '../../environment/environment';
import Swal from 'sweetalert2';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feedback2',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './feedback2.component.html',
  styleUrl: './feedback2.component.scss',
})
export class Feedback2Component {
  feedbackForm: FormGroup;
  chatbotVersion = 'Chatbot 2';
  submitted = false;

  @Output() feedbackComplete = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.feedbackForm = this.fb.group({
      name: ['', Validators.required],
      chatbotVersion: [this.chatbotVersion],
      chatMessage: [null, Validators.required],
      quickReply: [null, Validators.required],
      typingIndicator: [null, Validators.required],
      persistentMenu: [null],
      informationStamp: [null],
      sessionMinimization: [null, Validators.required],
      conversationClosure: [null, Validators.required],
      comments: [''],
    });
  }

  onSubmit() {
    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Ratings',
        text: 'Please complete all required rating questions before submitting.',
        confirmButtonColor: '#3498db',
      });

      return;
    }

    this.http
      .post(`${environment.backendUrl}/api/feedback`, this.feedbackForm.value)
      .subscribe({
        next: (res: any) => {
          this.feedbackForm.reset({ chatbotVersion: this.chatbotVersion });
          this.submitted = true;
          setTimeout(() => {
            this.feedbackComplete.emit();
          }, 3000);
        },
        error: (err: any) => console.error('Submission error:', err),
      });
  }

  cancel(): void {
    this.feedbackComplete.emit();
  }
}
