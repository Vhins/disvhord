import { Component, inject } from '@angular/core';
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
        '^(https?:\\/\\/)?' + // Protocollo (opzionale)
        '(' + // Inizio gruppo per hostname
        '(([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // Dominio
        'localhost|' + // localhost
        '((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)' + // Indirizzo IP
        ')' + // Fine gruppo per hostname
        '(\\:\\d+)?' + // Porta (opzionale)
        '(\\/[-a-z\\d%_.~+]*)*' + // Percorso (opzionale)
        '(\\?[-a-z\\d%_.~+&;=]*)?' + // Query string (opzionale, ora include & e =)
        '(\\#[-a-z\\d_]*)?' + // Fragment locator (opzionale)
        '$', // Fine della stringa
        'i' // Flag case-insensitive
    )
    invalidMediaLink: boolean = false
    
    chatService: ChatService = inject(ChatService)

    async onConfirmAllegateFile() {
        if (!this.linkRegExp.test(this.inputlinkValue)) return

        const linkType = this.chatService.linkType(this.inputlinkValue)
        if (linkType !== "link"){
            if (!await this.checkMediaValidity(this.inputlinkValue, linkType)){ 
                this.invalidMediaLink = true
                return
            }
        }

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

    checkMediaValidity(url: string, type: 'image' | 'video' | 'audio'): Promise<boolean> {
        return new Promise((resolve) => {
            let media: HTMLImageElement | HTMLVideoElement | HTMLAudioElement
    
            if (type === "image") {
                media = new Image()
                media.onload = () => resolve(true)
            } else {
                media = document.createElement(type)
                media.onloadedmetadata = () => resolve(true)
                ;(media as HTMLVideoElement | HTMLAudioElement).load()
            }

            media.onerror = () => resolve(false)
            media.src = url
        })
    }

}
