import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
})
export class RegistrationComponent {
  registrationForm: FormGroup;
  submitted = false;
  loading = false;
  error: string = '';
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize the form with validation
    this.registrationForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.registrationForm.controls as {
      [key: string]: import('@angular/forms').AbstractControl;
    };
  }
  onSubmit(): void {
    this.submitted = true;

    // Stop if the form is invalid
    if (this.registrationForm.invalid) {
      return;
    }

    this.loading = true;
    const { username, email, password } = this.registrationForm.value;

    // Call the authentication service to register the user
    this.authService.register(username, email, password).subscribe({
      next: (res: any) => {
        console.log('User registered successfully:', res);
        this.router.navigate(['/login']); // Redirect to login page
      },
      error: (err: { error: { message: string } }) => {
        console.error('Error registering user:', err);
        this.error = err.error.message || 'Failed to register.';
        this.loading = false;
      },
    });
  }
}
