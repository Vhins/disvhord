import { Routes } from '@angular/router';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { MainSiteComponent } from './main-site/main-site.component';
import { DisvhordAppComponent } from './disvhord-app/disvhord-app.component';
import { authGuard } from './auth/auth.guard';
import { ChatComponent } from './components/chat/chat-component/chat.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
    { path: '', component: MainSiteComponent },
    { path: 'app', canActivate: [authGuard], component: DisvhordAppComponent, children: [
        { path: 'home', component: HomeComponent, children: [
            { path: 'me', component: NavbarComponent },
            { path: 'chat/:chat_id', component: ChatComponent},
        ]},
        { path: 'server', component: ChatComponent},
    ]
    },
    { path: 'login', loadComponent: () => import('./auth/login/login.component').then(c => c.LoginComponent) },
    { path: 'register', loadComponent: () => import('./auth/register/register.component').then(c => c.RegisterComponent) },
    { path: 'terms', loadComponent: () => import('./terms/terms/terms.component').then(c => c.TermsComponent) },
    { path: 'settings', component: SettingsComponent },
    { path: '**', redirectTo: '' },
]

export const appConfig: ApplicationConfig = {
    providers: [provideRouter(routes)]
}
