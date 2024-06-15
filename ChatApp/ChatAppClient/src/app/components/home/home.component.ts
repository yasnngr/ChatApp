import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { UserModel } from '../../Models/user.model';
import { ChatModel } from '../../Models/chat.model';
import * as signalR from '@microsoft/signalr'
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ScrollPanel, ScrollPanelModule } from 'primeng/scrollpanel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, AvatarModule, AvatarGroupModule, ScrollPanelModule, InputGroupModule,
    InputGroupAddonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollPanel') scrollPanel!: ScrollPanel;
  @ViewChildren('box') boxes!: QueryList<ElementRef>;

  private observer!: IntersectionObserver;
  private messagesViewed: Set<string> = new Set();
  users: UserModel[] = [];
  user = new UserModel();
  chats: ChatModel[] = [];
  selectedUserId: string = "";
  selectedUser: UserModel = new UserModel();
  hub: signalR.HubConnection | undefined;
  message: string = "";
  messageId: string = "";
  isRead: boolean = false;
  messageIdFromRes: string = "";
  autoScroll: boolean = true;

  constructor(private router: Router, private http: HttpClient) {
    this.user = JSON.parse(localStorage.getItem("accessToken") ?? "")
    this.getUsers();

    this.hub = new signalR.HubConnectionBuilder().withUrl("https://localhost:7167/chat-hub").build();

    this.hub.start().then(() => {
      this.hub?.invoke("Connect", this.user.id)

      this.hub?.on("Users", (res: UserModel) => {
        this.users.find(p => p.id == res.id)!.status = res.status
      });

      this.hub?.on("Messages", (res: ChatModel) => {
        if (this.selectedUserId == res.userId) {
          this.chats.push(res);
        }
      })

      this.hub?.on("isRead", (messageId: string, status: boolean) => {
        this.messageIdFromRes = messageId;
        this.isRead = status;
      })
    })
  }


  ngAfterViewInit(): void {
    this.observeMessages();
    this.boxes.changes.subscribe(() => {
      this.observeMessages();
      this.scrollToBottom();
    });
    this.scrollPanel.el.nativeElement.addEventListener('scroll', () => {
      const element = this.scrollPanel.el.nativeElement;
      const atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
      this.autoScroll = atBottom;
    });
  }

  ngOnInit(): void {
    this.scrollToBottom()
    const options: IntersectionObserverInit = {
      root: null, 
      rootMargin: '0px',
      threshold: 0.5
    };

    this.observer = new IntersectionObserver(this.onIntersection.bind(this), options);
  }

  observeMessages() {
    this.boxes.forEach(box => {
      if (!this.messagesViewed.has(box.nativeElement.id)) {
        this.observer.observe(box.nativeElement);
      }
    });
  }

  onIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.messageId = entry.target.id;
        if (!this.messagesViewed.has(this.messageId)) {
          this.messagesViewed.add(this.messageId);
          // console.log(`Mesaj görüntülendi: ${this.messageId}`);
          this.hub?.invoke("MessageReadInfo", this.messageId)
          this.scrollToBottom();

          this.observer.unobserve(entry.target);
        }
      }
    });
  }

  getUsers() {
    this.http.get<UserModel[]>("https://localhost:7167/api/Chats/GetUsers").subscribe({
      next: (res) => {
        this.users = res.filter(p => p.id != this.user.id)
      }
    })
  }

  changeUser(user: UserModel) {
    this.selectedUserId = user.id;
    this.selectedUser = user;

    this.http.get(`https://localhost:7167/api/Chats/GetChats?userId=${this.user.id}&toUserId=${this.selectedUserId}`)
      .subscribe({
        next: (res: any) => {
          this.chats = res
        }
      })
  }

  sendMessage() {
    const data = {
      "userId": this.user.id,
      "toUserId": this.selectedUserId,
      "message": this.message
    }
    this.http.post<ChatModel>("https://localhost:7167/api/Chats/SendMessage", data).subscribe({
      next: (res) => {
        this.chats.push(res)
        this.message = "";
        this.scrollToBottom();
      }
    })
  }

  logout() {
    localStorage.clear();
    document.location.reload();
  }

  scrollToBottom() {
    if (this.autoScroll && this.scrollPanel && this.boxes.length > 0) {
      setTimeout(() => {
        const lastMessage = this.boxes.last.nativeElement;
        lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100); // Biraz gecikme ekleyerek DOM'un güncellenmesini bekleyelim
    }
  }

  ngOnDestroy(): void {
    
  }

}