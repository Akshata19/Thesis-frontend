import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { environment } from '../../environment/environment';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent {
  user: any = null;
  orders: any[] = [];

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      this.user = user;
      if (user?._id) {
        this.fetchOrders(user._id);
      }
    });
  }

  fetchOrders(userId: string): void {
    this.http
      .get(`${environment.backendUrl}/api/orders/by-user/${userId}`)
      .subscribe({
        next: (res: any) => {
          this.orders = res.orders || [];
        },
        error: () => {
          Swal.fire('Error', 'Could not fetch your orders', 'error');
        },
      });
  }
}
