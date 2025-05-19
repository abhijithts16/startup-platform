import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { FormComponent } from './pages/form/form.component';
import { AdminComponent } from './pages/admin/admin.component'; 

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'form/:type', component: FormComponent },
  { path: 'admin', component: AdminComponent }
];
