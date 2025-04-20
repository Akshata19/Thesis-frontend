import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [HttpClientModule, CommonModule, MatButtonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];

  // Filter states
  selectedPrice: string = '';
  selectedCategories: string[] = [];
  maxPrice: number = 2000;
  categoryOptions: string[] = ['Electronics', 'Clothing', 'Mobiles'];
  categoryCheckboxes: { [key: string]: boolean } = {};
  user: any = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.fetchProducts();
    this.route.queryParams.subscribe((params) => {
      const search = params['search'];
      if (search) {
        this.searchProducts(search);
      }
    });

    this.authService.user$.subscribe((user) => {
      this.user = user;
      console.log('[User]', this.user);
      console.log('[User ID]', this.user?._id);
    });
    this.categoryOptions.forEach((cat) => {
      this.categoryCheckboxes[cat] = false;
    });
  }

  fetchProducts(): void {
    this.http.get<any>('http://localhost:3000/api/products').subscribe(
      (response) => {
        if (response.success) {
          this.products = response.products;
          this.filteredProducts = [...this.products];

          // Extract unique category names
          this.categoryOptions = [
            ...new Set(this.products.map((p) => p.category)),
          ];
        }
      },
      (error) => {
        console.error('Error fetching products:', error.message);
      }
    );
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter((p) => {
      const matchCategory =
        this.selectedCategories.length === 0 ||
        this.selectedCategories.includes(p.category);

      const matchPrice =
        !this.selectedPrice ||
        (this.selectedPrice === 'low' && p.price < 100) ||
        (this.selectedPrice === 'mid' && p.price >= 100 && p.price <= 500) ||
        (this.selectedPrice === 'high' && p.price > 500);

      return matchCategory && matchPrice;
    });
  }

  resetFilters(): void {
    this.selectedCategories = [];
    this.selectedPrice = '';
    this.filteredProducts = [...this.products];
  }

  onCategoryChange(event: any): void {
    const value = event.target.value;
    if (event.target.checked) {
      this.selectedCategories.push(value);
    } else {
      this.selectedCategories = this.selectedCategories.filter(
        (cat) => cat !== value
      );
    }
    this.applyFilters();
  }

  onCategoryCheckboxChange(): void {
    // Update selectedCategories based on checkbox state
    this.selectedCategories = this.categoryOptions.filter(
      (cat) => this.categoryCheckboxes[cat]
    );
    this.applyFilters();
  }

  addToCart(product: any): void {
    if (this.user?._id) {
      // Logged-in user logic
      this.http
        .post('http://localhost:3000/api/cart/add', {
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
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login'; // or use Angular router
        }
      });
    }
  }

  searchProducts(query: string): void {
    this.filteredProducts = this.products.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
  }
}
