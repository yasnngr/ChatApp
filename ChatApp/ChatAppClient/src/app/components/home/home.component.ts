import { CommonModule, JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewChecked, AfterViewInit, Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
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
  imports: [ CommonModule , FormsModule,ButtonModule,AvatarModule,AvatarGroupModule,ScrollPanelModule,InputGroupModule,
    InputGroupAddonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
  @ViewChild('scrollPanel') scrollPanel!: ScrollPanel;
  users:UserModel[] = [];
  user = new UserModel();
  chats:ChatModel[] = [];
  selectedUserId: string = "";
  selectedUser: UserModel = new UserModel();
  hub : signalR.HubConnection | undefined;
  message:string="";

  constructor(private router:Router,private http:HttpClient){
    this.scrollToBottom()
    this.user = JSON.parse(localStorage.getItem("accessToken") ?? "") 
    this.getUsers();

    this.hub = new signalR.HubConnectionBuilder().withUrl("https://localhost:7167/chat-hub").build();
    
    this.hub.start().then(()=>{
      console.log("Connection Started")
      
      this.hub?.invoke("Connect", this.user.id)

      this.hub?.on("Users",(res:UserModel)=>{
        this.users.find(p=>p.id == res.id)!.status = res.status
      });

      this.hub?.on("Messages",(res:ChatModel)=>{
        if(this.selectedUserId == res.userId){
          this.chats.push(res);
        }
      })
    })
  }
  ngOnInit(): void {
   this.scrollToBottom()
  }
 
  getUsers(){
    this.http.get<UserModel[]>("https://localhost:7167/api/Chats/GetUsers").subscribe({
      next:(res)=>{
        this.users = res.filter(p=> p.id !=this.user.id)
      }
    })
  }

  changeUser(user: UserModel){
    this.selectedUserId = user.id;
    this.selectedUser = user;

    this.http.get(`https://localhost:7167/api/Chats/GetChats?userId=${this.user.id}&toUserId=${this.selectedUserId}`)
      .subscribe({
        next:(res:any)=>{
          this.chats = res
        }
      })
    // this.chats = Chats.filter(p=> p.toUserId == user.id && p.userId == "0" || p.userId == user.id && p.toUserId == "0");
  }

  sendMessage(){
    const data = {
      "userId": this.user.id,
      "toUserId": this.selectedUserId,
      "message": this.message
    }
    this.http.post<ChatModel>("https://localhost:7167/api/Chats/SendMessage",data).subscribe({
      next:(res)=>{
        this.chats.push(res)
        this.message="";
      }
    })
  }

  logout(){
    localStorage.clear();
    document.location.reload();
  }

  scrollToBottom() {
    if (this.scrollPanel) {
        this.scrollPanel.scrollTop(10000);
    }
  }
 
}