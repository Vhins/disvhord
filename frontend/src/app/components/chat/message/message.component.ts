import { Component, input } from '@angular/core';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {
    message: any = input()

    constructor() {}

    printtt() {
        console.log('message', this.message)
    }
}
