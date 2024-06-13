import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ScrollPanel, ScrollPanelModule } from 'primeng/scrollpanel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-show',
  standalone: true,
  imports: [FormsModule,ButtonModule,AvatarModule,AvatarGroupModule,ScrollPanelModule,InputGroupModule,InputGroupAddonModule,NgIf],
  templateUrl: './show.component.html',
  styleUrl: './show.component.scss'
})
export class ShowComponent {
users:any
selectedUserId:any
chats:any

@ViewChild('box', { static: true }) box!: ElementRef;
  isVisible: boolean = false;
explain:string="read information essay"
  constructor() { }

  ngOnInit(): void {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.isVisible = true;
          console.log(this.isVisible)
          console.log('Kutucuk göründü!');
        } else {
          this.isVisible = false;
          console.log(this.isVisible)
        }
      });
    }, options);

    observer.observe(this.box.nativeElement);
  }
}
