import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule], // ✅ Add CommonModule here
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  cartItems: any[] = [];
  user: any = null;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      this.user = user;
      if (user?._id) {
        this.fetchCart(user._id);
      } else {
        this.cartItems = [];
      }
    });
  }

  fetchCart(userId: string): void {
    this.http.get<any>(`http://localhost:3000/api/cart/${userId}`).subscribe({
      next: (res: { cart: { items: never[] } }) => {
        this.cartItems = res.cart?.items || [];
      },
      error: (err: any) => {
        Swal.fire('Error', 'Could not load cart', 'error');
      },
    });
  }

  removeItem(index: number): void {
    this.cartItems.splice(index, 1);
    if (!this.user?._id) {
      localStorage.setItem('guest_cart', JSON.stringify(this.cartItems));
    }
    Swal.fire('Removed', 'Item removed from cart.', 'info');
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => {
      const price = item.productId?.price || item.price || 0;
      const qty = item.quantity || 1;
      return sum + price * qty;
    }, 0);
  }
}
