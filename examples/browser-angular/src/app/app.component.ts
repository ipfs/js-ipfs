import { Component, OnInit } from '@angular/core';
import { IpfsService } from './ipfs.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'browser-angular';
  id: string | null = null;
  version: string | null  = null;
  status: string | null  = null;

  constructor(private IPFSService: IpfsService) {}

  ngOnInit() {
    this.start();
  }

  async start() {
    const id = await this.IPFSService.getId();
    this.id = id.id;

    const version = await this.IPFSService.getVersion();
    this.version = version.version

    const status = await this.IPFSService.getStatus();
    this.status = status ? 'Online' : 'Offline'
  }
}
