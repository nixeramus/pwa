import { Component, signal } from '@angular/core';
import { RouterOutlet,RouterLink  } from '@angular/router';
// Kendo UI модули
import { GridModule } from '@progress/kendo-angular-grid';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { AppBarModule,NavigationModule  } from '@progress/kendo-angular-navigation';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,RouterLink,ButtonsModule,LayoutModule,InputsModule,GridModule,AppBarModule,ButtonsModule,NavigationModule ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('barcode-pwa');
}
