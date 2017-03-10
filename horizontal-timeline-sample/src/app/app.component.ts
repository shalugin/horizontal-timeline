import { Component } from "@angular/core";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';

  content = `Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum praesentium officia, fugit recusandae 
  ipsa, quia velit nulla adipisci? Consequuntur aspernatur at, eaque hic repellendus sit dicta consequatur quae, 
  ut harum ipsam molestias maxime non nisi reiciendis eligendi! Doloremque quia pariatur harum ea amet quibusdam 
  quisquam, quae, temporibus dolores porro doloribus.`;

  timeline = [
    { caption: '16 Jan', date: new Date(2014, 1, 16), selected: true, title: 'Horizontal Timeline', content: this.content },
    { caption: '28 Feb', date: new Date(2014, 2, 28), title: 'Event title here', content: this.content },
    { caption: '20 Mar', date: new Date(2014, 3, 20), title: 'Event title here', content: this.content },
    { caption: '20 May', date: new Date(2014, 5, 20), title: 'Event title here', content: this.content },
    { caption: '09 Jul', date: new Date(2014, 7, 9), title: 'Event title here', content: this.content },
    { caption: '30 Aug', date: new Date(2014, 8, 30), title: 'Event title here', content: this.content },
    { caption: '15 Sep', date: new Date(2014, 9, 15), title: 'Event title here', content: this.content },
    { caption: '01 Nov', date: new Date(2014, 11, 1), title: 'Event title here', content: this.content },
    { caption: '10 Dec', date: new Date(2014, 12, 10), title: 'Event title here', content: this.content },
    { caption: '29 Jan', date: new Date(2015, 1, 19), title: 'Event title here', content: this.content },
    { caption: '3 Mar', date: new Date(2015, 3, 3), title: 'Event title here', content: this.content },
  ]
}
