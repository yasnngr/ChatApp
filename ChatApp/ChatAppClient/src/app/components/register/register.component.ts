import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterModel } from '../../Models/register.model';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule,ButtonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  register:RegisterModel = new RegisterModel();

  constructor(private http:HttpClient,private router:Router){
    
  }

  setImage(event:any){
    console.log(event)
    this.register.file=event.target.files[0];
  }
  
  registerButton(){
    const formData = new FormData();
    formData.append("name",this.register.name)
    formData.append("file",this.register.file,this.register.file.name)
    this.http.post(`https://localhost:7167/api/Auth/Register`,formData).subscribe({
      next:(res)=>{
        this.router.navigateByUrl("/")
      }
    })
  }
}
