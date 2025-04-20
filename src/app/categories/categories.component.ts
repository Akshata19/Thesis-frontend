import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button'; // Import MatButtonModule

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  newCategory: string = '';
  btnDisabled: boolean = false;
  stars = [1, 2, 3, 4, 5];

  constructor(private http: HttpClient, private router: Router) {}
  ngOnInit(): void {
    this.fetchCategories();
  }

  // Fetch all categories from the backend
  fetchCategories(): void {
    this.http.get<any>('http://localhost:3000/api/categories').subscribe(
      (response) => {
        if (response.success) {
          // Example: Add default images if none exist
          this.categories = response.categories.map((category: any) => ({
            ...category,
            image: category.CategoryImage || 'assets/default-category.jpg',
          }));
        } else {
          console.error('Failed to fetch categories.');
        }
      },
      (error) => {
        console.error('Error fetching categories:', error.message);
      }
    );
  }
  navigateToCategory(categoryId: string): void {
    this.router.navigate([`/categories/${categoryId}`]).then(
      (success) => {
        if (success) {
          console.log('Navigation successful');
        } else {
          console.error('Navigation failed');
        }
      },
      (error) => {
        console.error('Navigation error:', error);
      }
    );
  }
  addCategory(): void {
    if (!this.newCategory.trim()) return;

    this.btnDisabled = true;
    const categoryData = { name: this.newCategory };
    this.http
      .post<any>('http://localhost:3000/api/categories', categoryData)
      .subscribe(
        (response) => {
          if (response.success) {
            this.categories.push(response.category); // Add the new category to the list
            this.newCategory = ''; // Reset input field
          } else {
            console.error('Failed to add category.');
          }
          this.btnDisabled = false;
        },
        (error) => {
          console.error('Error adding category:', error.message);
          this.btnDisabled = false;
        }
      );
  }

  getImagePath(categoryName: string): string {
    return `assets/images/category/${categoryName.toLowerCase()}.png`;
  }
}
