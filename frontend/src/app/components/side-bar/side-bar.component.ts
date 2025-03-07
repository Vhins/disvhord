import { Component } from '@angular/core';
import { InitializeAppApiService } from '../../initialize-app-api.service';
import { NotificationsComponent } from "../notifications/notifications.component";

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [NotificationsComponent],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent{
    user_chat_name: string
    user_chat_logo: string

    constructor(private initializeAppService: InitializeAppApiService) {
        this.user_chat_name = this.initializeAppService.user_interface.user_displayName
        this.user_chat_logo = this.initializeAppService.user_interface.user_logo
    }

}
