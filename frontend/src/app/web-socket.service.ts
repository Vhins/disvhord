import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { InitializeAppApiService } from './initialize-app-api.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
    private socket: Socket

    InitializeAppApiService: InitializeAppApiService

    constructor(InitializeAppApiService: InitializeAppApiService) {
        this.InitializeAppApiService = InitializeAppApiService
      this.socket = io('http://localhost:3332')
      //! this.socket.emit('connect', user_id) // non credo sia sicuro
      console.log('InitializeAppApiService.user_interface.user_id', InitializeAppApiService.user_interface.user_id)
      this.socket.emit('connected', InitializeAppApiService.user_interface.user_id) // non credo sia sicuro
    }
  
    emit(eventName: string, data: any): void {
      this.socket.emit(eventName, data)
    }
  
    on(eventName: string): Observable<any> {
      return new Observable(observer => {
        this.socket.on(eventName, (data: any) => {
          observer.next(data)
        })
  
        return () => {
          this.socket.off(eventName)
        }
      })
    }

}
