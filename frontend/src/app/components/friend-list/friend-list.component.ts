import { Component } from '@angular/core';
import { InitializeAppApiService } from '../../initialize-app-api.service';

@Component({
  selector: 'app-friend-list',
  standalone: true,
  imports: [],
  templateUrl: './friend-list.component.html',
  styleUrl: './friend-list.component.css'
})
export class FriendListComponent {
    InitializeAppApiService: InitializeAppApiService

    constructor(initializeAppApiService: InitializeAppApiService) {
        this.InitializeAppApiService = initializeAppApiService
    }

    getFriendsList () {
        return this.InitializeAppApiService.user_interface.friends
    }

}
