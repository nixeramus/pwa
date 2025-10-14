import { Routes } from '@angular/router';


export const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'scan', loadComponent: () => import('./features/scanner/scanner').then(m => m.ScannerComponent) },
  { path: 'list', loadComponent: () => import('./features/list/list').then(m => m.ListComponent) },
  { path: '**', redirectTo: 'list' }
];