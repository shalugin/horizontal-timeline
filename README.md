# horizontal-timeline
Horizontal Timeline Component on Angular2 (original component: https://codyhouse.co/demo/horizontal-timeline/index.html)

# Usage

1. Clone repository.
1. Copy `horizontal-timeline` to your components folder.
1. Move `cd-arrow.svg` to your assets folder.
1. Modify `horizontal-timeline.component.css`: change url to your assets folder in line `background: url(assets/images/cd-arrow.svg) no-repeat 0 0;` (see https://github.com/angular/angular/issues/6637).
1. Use component on your page: `<horizontal-timeline [timelineElements]="timeline" [showContent]="true"></horizontal-timeline>`.

### Properties

| Name | Type | Description | Default value |
| --- | --- | --- | --- |
| `eventsMinDistance` | `number` | Minimal distance between elements in px | `80` |
| `timelineElements` | `TimelineElement` | Timeline elements | none |
| `dateFormat` | `string` | Date format string | `'dd.MM.yyyy'` |
| `disabled` | `boolean` | If `true`, only left and right buttons are clickable | `false` |
| `showContent` | `boolean` | Use `false` to hide content, `true` to show content | `false` |
| `timelineWrapperWidth` | `number` | Width of timeline wrapper in px | `720` |

### TimelineElement interface

| Name | Type | Description |
| --- | --- | --- |
| `date` | `Date` | Event date |
| `title` | `string` | Element content title |
| `selected` | `boolean` | Is element selected |
| `content` | `string` | Element content |
