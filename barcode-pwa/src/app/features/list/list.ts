import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { GridModule } from '@progress/kendo-angular-grid';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { StorageService } from '../../core/storage.service';

type Row = Awaited<ReturnType<StorageService['listAll']>>[number];

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, GridModule, ButtonsModule],
  providers: [DatePipe],
  templateUrl: './list.html',
  styleUrls: ['./list.scss']
})
export class ListComponent implements OnInit {
  data: Row[] = [];
  loading = false;
  info?: string;

  constructor(private store: StorageService) {}

  async ngOnInit() { await this.reload(); }

  async reload() {
    this.data = (await this.store.listAll()).sort((a,b)=> b.createdAt - a.createdAt);
  }

  async clearAll() {
    this.loading = true;
    await this.store.clearAll();
    await this.reload();
    this.loading = false;
  }

  async validate() {
    this.info = 'Пока без сервера: коды в статусе pending';
  }
}
