import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  ViewChildren,
  QueryList,
  AfterViewInit,
  animate,
  transition,
  style,
  trigger,
  keyframes,
  state
} from "@angular/core";
import { TimelineElement } from "./timeline-element";

@Component({
  selector: 'horizontal-timeline',
  templateUrl: 'horizontal-timeline.component.html',
  styleUrls: ['horizontal-timeline.component.css'],
  animations: [
    trigger('contentState', [
      state('active', style({
        position: 'relative', 'z-index': 2, opacity: 1,
      })),
      transition('right => active', [
        style({
          transform: 'translateX(100%)'
        }),
        animate('400ms ease-in-out', keyframes([
          style({ opacity: 0, transform: 'translateX(100%)', offset: 0 }),
          style({ opacity: 1, transform: 'translateX(0%)', offset: 1.0 })
        ]))
      ]),
      transition('active => right', [
        style({
          transform: 'translateX(-100%)'
        }),
        animate('400ms ease-in-out', keyframes([
          style({ opacity: 1, transform: 'translateX(0%)', offset: 0 }),
          style({ opacity: 0, transform: 'translateX(100%)', offset: 1.0 })
        ]))
      ]),
      transition('active => left', [
        style({
          transform: 'translateX(-100%)'
        }),
        animate('400ms ease-in-out', keyframes([
          style({ opacity: 1, transform: 'translateX(0%)', offset: 0 }),
          style({ opacity: 0, transform: 'translateX(-100%)', offset: 1.0 })
        ]))
      ]),
      transition('left => active', [
        style({
          transform: 'translateX(100%)'
        }),
        animate('400ms ease-in-out', keyframes([
          style({ opacity: 0, transform: 'translateX(-100%)', offset: 0 }),
          style({ opacity: 1, transform: 'translateX(0%)', offset: 1.0 })
        ]))
      ]),
    ])
  ]
})
export class HorizontalTimelineComponent implements AfterViewInit {
  private timelineTotWidth: number = 0;
  prevLinkInactive: boolean = true;
  nextLinkInactive: boolean = false;
  loaded: boolean = false;
  selectedIndex: number = 0;

  @Input() eventsMinDistance: number = 100;
  @Input() timelineElements: TimelineElement[];

  @ViewChild('timelineWrapper') timelineWrapper: ElementRef;
  @ViewChild('eventsWrapper') eventsWrapper: ElementRef;
  @ViewChild('fillingLine') fillingLine: ElementRef;
  @ViewChild('eventsContent') eventsContent: ElementRef;
  @ViewChildren('timelineEvents') timelineEvents: QueryList<ElementRef>;

  ngAfterViewInit(): void {
    if (this.timelineElements && this.timelineElements.length) {
      for (let i = 0; i < this.timelineElements.length; i++) {
        if (this.timelineElements[i].selected) {
          this.selectedIndex = i;
          break;
        }
      }
      this.initTimeline(this.timelineElements);
    }
  }

  onPrevClick(event) {
    event.preventDefault();
    this.updateSlide(this.timelineTotWidth, 'prev');
  }

  onNextClick(event) {
    event.preventDefault();
    this.updateSlide(this.timelineTotWidth, 'next');
  }

  onEventClick(event, selectedItem: TimelineElement) {
    event.preventDefault();
    let element = event.target;
    // detect click on the a single event - show new event content
    let visibleItem = this.timelineElements[0];
    this.timelineElements.forEach(function (item: TimelineElement) {
      if (item.selected && item != selectedItem) {
        visibleItem = item;
        item.selected = false;
      }
    });
    this.selectedIndex = this.timelineElements.indexOf(selectedItem);
    selectedItem.selected = true;
    HorizontalTimelineComponent.updateOlderEvents(element);
    HorizontalTimelineComponent.updateFilling(element, this.fillingLine, this.timelineTotWidth);
    this.updateVisibleContent(element, this.eventsContent.nativeElement, selectedItem, visibleItem);
  }

  initTimeline(timeLines: TimelineElement[]) {
    let eventsMinLapse = HorizontalTimelineComponent.minLapse(timeLines);
    // assign a left position to the single events along the timeline
    this.setDatePosition(timeLines, this.eventsMinDistance, eventsMinLapse);
    // assign a width to the timeline
    this.timelineTotWidth = this.setTimelineWidth(timeLines, this.eventsMinDistance,
      eventsMinLapse);
    // the timeline has been initialize - show it
    this.loaded = true;
  }

  updateSlide(timelineTotWidth, string) {
    // retrieve translateX value of eventsWrapper
    let translateValue = HorizontalTimelineComponent.getTranslateValue(this.eventsWrapper.nativeElement);
    let wrapperWidth = Number(window.getComputedStyle(this.timelineWrapper.nativeElement).width.replace('px', ''));
    // translate the timeline to the left('next')/right('prev')
    if (string == 'next') {
      this.translateTimeline(translateValue - wrapperWidth + this.eventsMinDistance, wrapperWidth - timelineTotWidth)
    } else {
      this.translateTimeline(translateValue + wrapperWidth - this.eventsMinDistance, null);
    }
  }

  updateTimelinePosition(string, element) {
    // translate timeline to the left/right according to the position of the selected event
    let eventStyle = window.getComputedStyle(element, null);
    let eventLeft = Number(eventStyle.getPropertyValue('left').replace('px', ''));
    let timelineWidth = Number(window.getComputedStyle(this.timelineWrapper.nativeElement).width.replace('px', ''));
    let timelineTotWidth = Number(window.getComputedStyle(this.eventsWrapper.nativeElement).width.replace('px', ''));
    let timelineTranslate = HorizontalTimelineComponent.getTranslateValue(this.eventsWrapper.nativeElement);

    if ((string == 'next' && eventLeft > timelineWidth - timelineTranslate) || (string == 'prev' && eventLeft < -timelineTranslate)) {
      this.translateTimeline(-eventLeft + timelineWidth / 2, timelineWidth - timelineTotWidth);
    }
  }

  translateTimeline(value: number, totWidth: number) {
    // only negative translate value
    value = (value > 0) ? 0 : value;
    // do not translate more than timeline width
    value = ( !(totWidth == null) && value < totWidth ) ? totWidth : value;
    HorizontalTimelineComponent.setTransformValue(this.eventsWrapper.nativeElement, 'translateX', value + 'px');
    // update navigation arrows visibility
    this.prevLinkInactive = value == 0;
    this.nextLinkInactive = value == totWidth;
  }

  private static updateFilling(selectedEvent, filling, totWidth) {
    // change .filling-line length according to the selected event
    let eventStyle = window.getComputedStyle(selectedEvent, null);
    let eventLeft = eventStyle.getPropertyValue("left");
    let eventWidth = eventStyle.getPropertyValue("width");
    let eventLeftNum = Number(eventLeft.replace('px', '')) + Number(eventWidth.replace('px', '')) / 2;
    let scaleValue = eventLeftNum / totWidth;
    HorizontalTimelineComponent.setTransformValue(filling.nativeElement, 'scaleX', scaleValue);
  }

  private setDatePosition(elements: TimelineElement[], min: number, eventsMinLapse: number) {
    let timelineEventsArray = this.timelineEvents.toArray();
    let i: number = 0;
    for (let component of elements) {
      let distance = HorizontalTimelineComponent.dayDiff(elements[0].date, component.date);
      let distanceNorm = Math.round(distance / eventsMinLapse) + 2;
      timelineEventsArray[i].nativeElement.style.left = distanceNorm * min + 'px';
      i++;
    }
  }

  setTimelineWidth(elements: TimelineElement[], width, eventsMinLapse: number) {
    let timeSpan = HorizontalTimelineComponent.dayDiff(elements[0].date, elements[elements.length - 1].date);
    let timeSpanNorm = timeSpan / eventsMinLapse;
    timeSpanNorm = Math.round(timeSpanNorm) + 4;
    let totalWidth = timeSpanNorm * width;
    this.eventsWrapper.nativeElement.style.width = totalWidth + 'px';
    let aHref = this.eventsWrapper.nativeElement.querySelectorAll('a.selected')[0];
    HorizontalTimelineComponent.updateFilling(aHref, this.fillingLine, totalWidth);
    this.updateTimelinePosition('next', aHref);
    return totalWidth;
  }

  updateVisibleContent(element, eventsContent, selectedItem: TimelineElement, visibleItem: TimelineElement) {
    let eventDate = element.attributes.getNamedItem('data-date').value;
    let visibleContent = eventsContent.querySelector('.selected');
    let selectedContent = eventsContent.querySelector('[data-date="' + eventDate + '"]');
    let selectedContentHeight = window.getComputedStyle(selectedContent, null).height;

    eventsContent.style.height = selectedContentHeight;
  }

  private static parentElement(element, tagName: string) {
    if (!element || !element.parentNode) {
      return null;
    }

    let parent = element.parentNode;
    while (true) {
      if (parent.tagName.toLowerCase() == tagName) {
        return parent;
      }
      parent = parent.parentNode;
      if (!parent) {
        return null;
      }
    }
  }

  private static updateOlderEvents(element) {
    let parentElement = HorizontalTimelineComponent.parentElement(element, 'li');
    if (!parentElement || !parentElement.parentNode) {
      return;
    }

    let before = true;
    if (parentElement.parentNode.children && parentElement.parentNode.children.length) {
      for (let item of parentElement.parentNode.children) {
        if (item == parentElement) {
          before = false;
          return;
        }
        if (before) {
          item.querySelector('a').classList.add('older-event');
        } else {
          item.querySelector('a').classList.remove('older-event');
        }
      }
    }
  }

  private static getTranslateValue(timeline) {
    let timelineStyle = window.getComputedStyle(timeline, null);
    let timelineTranslate = timelineStyle.getPropertyValue("-webkit-transform") ||
      timelineStyle.getPropertyValue("-moz-transform") ||
      timelineStyle.getPropertyValue("-ms-transform") ||
      timelineStyle.getPropertyValue("-o-transform") ||
      timelineStyle.getPropertyValue("transform");

    let translateValue = 0;
    if (timelineTranslate.indexOf('(') >= 0) {
      let timelineTranslateStr = timelineTranslate
        .split('(')[1]
        .split(')')[0]
        .split(',')[4];
      translateValue = Number(timelineTranslateStr);
    }

    return translateValue;
  }

  private static setTransformValue(element, property, value) {
    element.style["-webkit-transform"] = property + "(" + value + ")";
    element.style["-moz-transform"] = property + "(" + value + ")";
    element.style["-ms-transform"] = property + "(" + value + ")";
    element.style["-o-transform"] = property + "(" + value + ")";
    element.style["transform"] = property + "(" + value + ")";
  }

  private static dayDiff(first, second) {
    return Math.round(second - first);
  }

  private static minLapse(elements: TimelineElement[]) {
    let result: number;
    for (let i = 1; i < elements.length; i++) {
      let distance = HorizontalTimelineComponent.dayDiff(elements[i - 1].date, elements[i].date);
      result = result ? Math.min(result, distance) : distance;
    }
    return result;
  }
}
