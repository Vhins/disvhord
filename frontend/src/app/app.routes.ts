import { Routes } from '@angular/router';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { MainSiteComponent } from './main-site/main-site.component';
import { DisvhordAppComponent } from './disvhord-app/disvhord-app.component';
import { authGuard } from './auth/auth.guard';
import { ChatsComponent } from './components/chats/chats.component';
import { RapidControlsComponent } from './components/rapid-controls/rapid-controls.component';
import { FriendListComponent } from './components/friend-list/friend-list.component';
import { ChatComponent } from './components/chat/chat.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';


export const routes: Routes = [
    { path: '', component: MainSiteComponent },
    { path: 'app', canActivate: [authGuard], component: DisvhordAppComponent, children: [
        { path: 'home', component: HomeComponent, children: [
            { path: 'me', component: NavbarComponent },
            { path: 'chat', component: ChatComponent },
        ]},
        { path: 'server', component: ChatComponent}
    ]
    },
    { path: 'login', loadComponent: () => import('./auth/login/login.component').then(c => c.LoginComponent) },
    { path: 'register', loadComponent: () => import('./auth/register/register.component').then(c => c.RegisterComponent) },
    { path: '**', redirectTo: '' },
];

export const appConfig: ApplicationConfig = {
    providers: [provideRouter(routes)]
};