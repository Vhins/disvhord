import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
    private socket: Socket

    constructor() {
      this.socket = io('http://localhost:3332')
      //! this.socket.emit('connect', user_id) // non credo sia sicuro
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
