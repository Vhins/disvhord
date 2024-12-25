import { Routes } from '@angular/router';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { MainSiteComponent } from './main-site/main-site.component';
import { DisvhordAppComponent } from './disvhord-app/disvhord-app.component';
import { authGuard } from './auth/auth.guard';


export const routes: Routes = [
    { path: '', component: MainSiteComponent },
    { path: 'app', canActivate: [authGuard] , component: DisvhordAppComponent },
    { path: 'login', loadComponent: () => import('./auth/login/login.component').then(c => c.LoginComponent) },
    { path: 'register', loadComponent: () => import('./auth/register/register.component').then(c => c.RegisterComponent) },
    { path: '**', redirectTo: '' },
];

export const appConfig: ApplicationConfig = {
    providers: [provideRouter(routes)]
};