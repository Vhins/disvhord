import { Injectable } from '@angular/core';
import { InitializeAppApiService } from './initialize-app-api.service';
import { WebSocketService } from './web-socket.service';
import { Router } from '@angular/router';
import { NotificationsService } from './notifications.service';

@Injectable({
  providedIn: 'root'
})
export class DataResolver {
    constructor(private initializeAppApiService: InitializeAppApiService, private webSocketService: WebSocketService, private ruoter: Router, private notificationsService: NotificationsService) {}

    async resolve(): Promise<boolean> {        
        const RESULT = await this.initializeAppApiService.get_basicUserInterfaceData()
        const RANDOM_DELAY = Math.floor(Math.random() * 1700) + 300

        return this.startServices(RESULT) // RANDOM_DELAY
    }

    private startServices(result: boolean, radommDelay: number = 20): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            setTimeout(() => {

                if (result === true) {
                    const STARTED = this.webSocketService.start()
                    if (STARTED === true) {
                        this.notificationsService.listenForNotifications()
                        resolve(true)
                    } 
                } else {
                    this.ruoter.navigate(['/login'])
                    resolve(false)
                }
                
            }, radommDelay)
        })
    }
}
