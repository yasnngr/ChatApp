import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,ButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
name:string = "";

constructor(private http:HttpClient,private router:Router){
  

}
loginButton(){
  this.http.get(`https://localhost:7167/api/Auth/Login?name=${this.name}`).subscribe({
    next:(res)=>{
      localStorage.setItem("accessToken",JSON.stringify(res))
      this.router.navigateByUrl("/")
    }
  })
}
}
