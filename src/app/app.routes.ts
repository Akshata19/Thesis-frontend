import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/products.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { CartComponent } from './cart/cart.component';
import { CategoriesComponent } from './categories/categories.component';
import { ProductListComponent } from './product-list/product-list.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { ChattbotComponent } from './chattbot/chattbot.component';
import { MyAccountComponent } from './my-account/my-account.component';
export const appRoutes: Routes = [
  { path: '', component: HomeComponent }, // Default route
  { path: 'products', component: ProductsComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  // { path: '**', redirectTo: '', pathMatch: 'full' }, // Wildcard route for invalid URLs
  { path: 'categories', component: CategoriesComponent },
  { path: 'categories/:categoryId', component: ProductListComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'chat', component: ChattbotComponent },
  { path: 'account', component: MyAccountComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
