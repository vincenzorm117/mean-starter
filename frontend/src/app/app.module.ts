import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './components/app/app.component';
import { EventManagerService } from './services/event-manager.service';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [EventManagerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
