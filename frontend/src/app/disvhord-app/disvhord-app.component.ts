import { Component } from '@angular/core';
import { ServerListComponent } from "../components/server-list/server-list.component";
import { RouterOutlet } from '@angular/router';
import { DataResolver } from '../data-resolver.service';
import { NotificationComponent } from "../components/notification/notification.component";

@Component({
  selector: 'app-disvhord-app',
  standalone: true,
  imports: [ServerListComponent, RouterOutlet, NotificationComponent],
  templateUrl: './disvhord-app.component.html',
  styleUrl: './disvhord-app.component.css'
})
export class DisvhordAppComponent {
    dataResolved = false

    constructor(private dataResolver: DataResolver) {
        this.loadData()
    }

    async loadData() {
        this.dataResolved = await this.dataResolver.resolve()
    }
}
