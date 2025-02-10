import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-add-link-popup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-link-popup.component.html',
  styleUrl: './add-link-popup.component.css'
})
export class AddLinkPopupComponent implements AfterViewInit {
    inputlinkValue: string = ""

    constructor(private chatService: ChatService) {}

    onConfirmAllegateFile(): void {
        this.chatService.allegatingLink.set(false)
        this.chatService.allegatedLink = this.inputlinkValue
    }

    onExit(): void {
        this.chatService.allegatingLink.set(false)
        this.resetValues()
    }

    ngAfterViewInit(): void {
        this.resetValues()
    }

    resetValues(): void {
        this.inputlinkValue = ""
        this.chatService.allegatedLink = ""
    }

}
