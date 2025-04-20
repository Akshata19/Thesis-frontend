import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchProducts();
    this.http
      .get<any>('http://localhost:3000/api/categories')
      .subscribe((res) => {
        this.categories = res.categories;
        console.log(this.categories);
      });
  }

  fetchProducts(): void {
    this.http.get<any>('http://localhost:3000/api/products').subscribe(
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
}
