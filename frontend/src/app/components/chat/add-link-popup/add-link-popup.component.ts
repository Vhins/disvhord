import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-add-link-popup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-link-popup.component.html',
  styleUrl: './add-link-popup.component.css'
})
export class AddLinkPopupComponent {
    inputlinkValue: string = ""

    constructor(private chatService: ChatService) {}

    onAllegateFile() {
        this.chatService.allegatingLink = false
        this.chatService.allegateLink(this.inputlinkValue)
    }

    onExit() {
        this.inputlinkValue = "" //* reset to inital value
        this.chatService.allegatingLink = false
        this.chatService.allegateLink("")
    }

}
