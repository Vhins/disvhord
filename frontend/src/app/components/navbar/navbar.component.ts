import { Component } from '@angular/core';
import { FriendListComponent } from "../friend-list/friend-list.component";
import { YourPostComponent } from "../your-post/your-post.component";
import { RecentActivitiesComponent } from "../recent-activities/recent-activities.component";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FriendListComponent, YourPostComponent, RecentActivitiesComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
    showFriendList: boolean = true
    showRecentActivities: boolean = false
    showYourPost: boolean = false

    show(show: string) {
        if (show == 'friendList') {
            this.showFriendList = true
            this.showRecentActivities = false
            this.showYourPost = false
        } else if (show == 'recentActivities') {
            this.showFriendList = false
            this.showRecentActivities = true
            this.showYourPost = false
        } else if (show == 'yourPost') {
            this.showFriendList = false
            this.showRecentActivities = false
            this.showYourPost = true
        }
    }
}
