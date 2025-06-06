import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environment/environment';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  categories: any[] = [];
  selectedCategory = '';
  priceRange = '';
  searchQuery = '';
  user: any = null;
  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.fetchProducts();
    this.http
      .get<any>(`${environment.backendUrl}/api/categories`)
      .subscribe((res) => {
        this.categories = res.categories;
        console.log(this.categories);
      });
    this.authService.user$.subscribe((user) => {
      this.user = user;
      console.log('[User]', this.user);
      console.log('[User ID]', this.user?._id);
    });
  }

  fetchProducts(): void {
    this.http.get<any>(`${environment.backendUrl}/api/products`).subscribe(
      (response) => {
        if (response.success) {
          this.products = response.products;

          // Initially show all
          this.filteredProducts = [...this.products];
        } else {
          console.error('Failed to fetch products.');
        }
      },
      (error) => {
        console.error('Error fetching products:', error);
      }
    );
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter((product) => {
      const matchesName = product.name
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase());

      const matchesCategory =
        !this.selectedCategory ||
        product.category?.name === this.selectedCategory;

      const matchesPrice =
        !this.priceRange ||
        (this.priceRange === 'low' && product.price < 100) ||
        (this.priceRange === 'mid' &&
          product.price >= 100 &&
          product.price <= 500) ||
        (this.priceRange === 'high' && product.price > 500);

      return matchesName && matchesCategory && matchesPrice;
    });
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.priceRange = '';
    this.applyFilters(); // Reapply with empty filters
  }

  addToCart(product: any): void {
    if (this.user?._id) {
      // Logged-in user logic
      this.http
        .post(`${environment.backendUrl}/api/cart/add`, {
          userId: this.user._id,
          productId: product._id,
        })
        .subscribe({
          next: () =>
            Swal.fire({
              icon: 'success',
              title: 'Added to Cart',
              text: `${product.name} has been added to your cart.`,
              timer: 1800,
              showConfirmButton: false,
              toast: true,
              position: 'top-end',
            }),
          error: (err) => console.error('❌ Add to cart error', err),
        });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please log in to add items to your cart.',
        confirmButtonText: 'Go to Login',
        showCancelButton: true,
      }).then((result: { isConfirmed: any }) => {
        if (result.isConfirmed) {
          window.location.href = '/login'; // or use Angular router
        }
      });
    }
  }
}
