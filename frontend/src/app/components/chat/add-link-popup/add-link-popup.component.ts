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
    linkRegExp: RegExp = new RegExp(
        '^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i' // fragment locator
    )

    constructor(private chatService: ChatService) {}

    onConfirmAllegateFile(): void {
        if (!this.linkRegExp.test(this.inputlinkValue)) return 
        this.chatService.allegatingLink.set(false)
        this.chatService.allegatedLink = this.inputlinkValue
    }

    onExit(): void {
        this.chatService.allegatingLink.set(false)
        this.resetValues()
    }

    resetValues(): void {
        this.inputlinkValue = ""
        //? this.chatService.allegatedLink = ""
    }

}
