import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../environment/environment';

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
    this.http
      .get<any>(`${environment.backendUrl}/api/cart/${userId}`)
      .subscribe({
        next: (res: { cart: { items: never[] } }) => {
          this.cartItems = res.cart?.items || [];
        },
        error: (err: any) => {
          Swal.fire('Error', 'Could not load cart', 'error');
        },
      });
  }

  removeItem(index: number): void {
    const item = this.cartItems[index];

    if (!this.user?._id || !item?.productId) {
      return;
    }

    this.http
      .post(`${environment.backendUrl}/api/cart/remove`, {
        userId: this.user._id,
        productId: item.productId._id,
      })
      .subscribe({
        next: () => {
          this.cartItems.splice(index, 1);
          Swal.fire('Removed', 'Item removed from cart.', 'info');
        },
        error: () => {
          Swal.fire('Error', 'Could not remove item from server.', 'error');
        },
      });
  }
  placeOrder(): void {
    if (!this.user?._id) return;

    this.http
      .post(`${environment.backendUrl}/api/orders/place`, {
        userId: this.user._id,
      })
      .subscribe({
        next: (res: any) => {
          Swal.fire(
            'Success',
            `Order placed! Tracking ID: ${res.trackingId}`,
            'success'
          );
          this.cartItems = [];
        },
        error: (err) => {
          Swal.fire(
            'Error',
            err.error?.message || 'Could not place the order.',
            'error'
          );
        },
      });
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => {
      const price = item.productId?.price || item.price || 0;
      const qty = item.quantity || 1;
      return sum + price * qty;
    }, 0);
  }

  fetchOrders(): void {
    this.http
      .get(`${environment.backendUrl}/api/orders/${this.user._id}`)
      .subscribe({
        next: (res: any) => {
          console.log('Orders:', res.orders); // Replace this with display logic
        },
        error: () => {
          Swal.fire('Error', 'Could not fetch orders', 'error');
        },
      });
  }
}
