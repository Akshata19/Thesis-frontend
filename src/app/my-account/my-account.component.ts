import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2'; // 💡 SweetAlert2

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.scss',
})
export class MyAccountComponent {
  profileForm!: FormGroup;
  isEditMode = false;
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Retrieve current user from AuthService
    const currentUser = this.authService.currentUser;
    console.log(currentUser);

    if (!currentUser || !currentUser._id) {
      console.warn('No valid user found in storage');
      return;
    }

    this.userId = currentUser._id;

    // Initialize form
    this.profileForm = this.fb.group({
      username: [''],
      email: [''],
      firstName: [''],
      lastName: [''],
      address: [''],
    });

    this.profileForm.disable();

    this.http
      .get<any>(`http://localhost:3000/api/users/${this.userId}`)
      .subscribe(
        (res) => {
          const user = res.user;
          this.profileForm.patchValue({
            username: user.username,
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            address: user.address || '',
          });
        },
        (err) => {
          console.error('Failed to fetch user data:', err);
          alert('Could not fetch user info from server');
        }
      );
  }

  enableEdit(): void {
    this.isEditMode = true;
    this.profileForm.enable();
  }

  deleteAccount(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        const userId = this.authService.currentUser?._id;
        this.http.delete(`http://localhost:3000/api/users/${userId}`).subscribe(
          () => {
            Swal.fire('Deleted!', 'Your account has been deleted.', 'success');
            this.authService.logout();
          },
          (err) => {
            console.error('Error deleting account:', err);
            Swal.fire('Oops', 'Failed to delete account. Try again.', 'error');
          }
        );
      }
    });
  }

  saveChanges(): void {
    if (this.profileForm.valid) {
      const updatedData = this.profileForm.value;
      const userId = this.authService.currentUser?._id;

      this.http
        .put(`http://localhost:3000/api/users/${userId}`, updatedData)
        .subscribe(
          (res) => {
            console.log('User updated:', res);
            this.isEditMode = false;
            this.profileForm.disable();
          },
          (err) => {
            console.error('Error updating user:', err);
          }
        );
    }
  }

  get isProfileIncomplete(): boolean {
    if (!this.profileForm) return false;

    const values = this.profileForm.value;
    return (
      !values['firstName']?.trim() ||
      !values['lastName']?.trim() ||
      !values['address']?.trim()
    );
  }
}
