import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { inject } from '@angular/core';
import { AuthService } from './Services/auth.service';
import { ShowComponent } from './show/show.component';

export const routes: Routes = [
    {path:"",component:HomeComponent, canActivate:[()=>inject(AuthService).isAuthenticated()]},
    {path:"login",component:LoginComponent},
    {path:"register",component:RegisterComponent},
    {path:"show",component:ShowComponent}
];
