import { AfterViewInit, Component, ElementRef, Input, QueryList, ViewChild, ViewChildren, } from '@angular/core';
import { TimelineElement } from './timeline-element';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';

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
  prevLinkInactive: boolean = true;
  nextLinkInactive: boolean = false;
  loaded: boolean = false;
  selectedIndex: number = 0;
  @Input() eventsMinDistance: number = 80;
  @Input() timelineElements: TimelineElement[];
  @Input() dateFormat: string = 'dd.MM.yyyy';
  @Input() disabled: boolean = false;
  @Input() showContent: boolean = false;
  @ViewChild('timelineWrapper') timelineWrapper: ElementRef;
  @ViewChild('eventsWrapper') eventsWrapper: ElementRef;
  @ViewChild('fillingLine') fillingLine: ElementRef;
  @ViewChild('eventsContent') eventsContent: ElementRef;
  @ViewChildren('timelineEvents') timelineEvents: QueryList<ElementRef>;
  private timelineTotWidth: number = 0;

  private static pxToNumber(val: string): number {
    return Number(val.replace('px', ''));
  }

  private static getElementWidth(element: Element): number {
    const computedStyle = window.getComputedStyle(element);
    if (!computedStyle.width) {
      return 0;
    }
    return HorizontalTimelineComponent.pxToNumber(computedStyle.width);
  }

  private static updateFilling(selectedEvent: any, filling: any, totWidth: number) {
    // change .filling-line length according to the selected event
    let eventStyle = window.getComputedStyle(selectedEvent);
    let eventLeft = eventStyle.getPropertyValue('left');
    let eventWidth = eventStyle.getPropertyValue('width');
    let eventLeftNum = HorizontalTimelineComponent.pxToNumber(eventLeft) + HorizontalTimelineComponent.pxToNumber(eventWidth) / 2;
    let scaleValue = eventLeftNum / totWidth;
    HorizontalTimelineComponent.setTransformValue(filling.nativeElement, 'scaleX', scaleValue);
  }

  private static parentElement(element: any, tagName: string) {
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

  private static getTranslateValue(timeline: Element) {
    let timelineStyle = window.getComputedStyle(timeline);
    let timelineTranslate = timelineStyle.getPropertyValue('-webkit-transform') ||
      timelineStyle.getPropertyValue('-moz-transform') ||
      timelineStyle.getPropertyValue('-ms-transform') ||
      timelineStyle.getPropertyValue('-o-transform') ||
      timelineStyle.getPropertyValue('transform');

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

  private static setTransformValue(element: any, property: any, value: any) {
    element.style['-webkit-transform'] = property + '(' + value + ')';
    element.style['-moz-transform'] = property + '(' + value + ')';
    element.style['-ms-transform'] = property + '(' + value + ')';
    element.style['-o-transform'] = property + '(' + value + ')';
    element.style['transform'] = property + '(' + value + ')';
  }

  private static dayDiff(first: any, second: any) {
    return Math.round(second - first);
  }

  private static minLapse(elements: TimelineElement[]) {
    let result: number = 0;
    for (let i = 1; i < elements.length; i++) {
      let distance = HorizontalTimelineComponent.dayDiff(elements[i - 1].date, elements[i].date);
      result = result ? Math.min(result, distance) : distance;
    }
    return result;
  }

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

  onPrevClick(event: Event) {
    event.preventDefault();
    this.updateSlide(this.timelineTotWidth, 'prev');
  }

  onNextClick(event: Event) {
    event.preventDefault();
    this.updateSlide(this.timelineTotWidth, 'next');
  }

  onEventClick(event: Event, selectedItem: TimelineElement) {
    event.preventDefault();
    if (this.disabled) {
      return;
    }
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
    HorizontalTimelineComponent.updateFilling(element, this.fillingLine, this.timelineTotWidth);
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

  updateSlide(timelineTotWidth: number, string: string) {
    // retrieve translateX value of eventsWrapper
    let translateValue = HorizontalTimelineComponent.getTranslateValue(this.eventsWrapper.nativeElement);
    let wrapperWidth = HorizontalTimelineComponent.getElementWidth(this.timelineWrapper.nativeElement);
    // translate the timeline to the left('next')/right('prev')
    if (string === 'next') {
      this.translateTimeline(translateValue - wrapperWidth + this.eventsMinDistance, wrapperWidth - timelineTotWidth)
    } else {
      this.translateTimeline(translateValue + wrapperWidth - this.eventsMinDistance, null);
    }
  }

  updateTimelinePosition(string: string, element: Element) {
    // translate timeline to the left/right according to the position of the selected event
    let eventStyle = window.getComputedStyle(element);
    let eventLeft = HorizontalTimelineComponent.pxToNumber(eventStyle.getPropertyValue('left'));
    let timelineWidth = HorizontalTimelineComponent.getElementWidth(this.timelineWrapper.nativeElement);
    let timelineTotWidth = HorizontalTimelineComponent.getElementWidth(this.eventsWrapper.nativeElement);
    let timelineTranslate = HorizontalTimelineComponent.getTranslateValue(this.eventsWrapper.nativeElement);

    if ((string === 'next' && eventLeft > timelineWidth - timelineTranslate) || (string === 'prev' && eventLeft < -timelineTranslate)) {
      this.translateTimeline(-eventLeft + timelineWidth / 2, timelineWidth - timelineTotWidth);
    }
  }

  translateTimeline(value: number, totWidth: number | null) {
    // only negative translate value
    value = (value > 0) ? 0 : value;
    // do not translate more than timeline width
    value = ( !(totWidth == null) && value < totWidth ) ? totWidth : value;
    HorizontalTimelineComponent.setTransformValue(this.eventsWrapper.nativeElement, 'translateX', value + 'px');
    // update navigation arrows visibility
    this.prevLinkInactive = value == 0;
    this.nextLinkInactive = value == totWidth;
  }

  setTimelineWidth(elements: TimelineElement[], width: number, eventsMinLapse: number) {
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

  private setDatePosition(elements: TimelineElement[], min: number, eventsMinLapse: number) {
    let timelineEventsArray = this.timelineEvents.toArray();
    let i: number = 0;
    for (let component of elements) {
      let distance = HorizontalTimelineComponent.dayDiff(elements[0].date, component.date);
      let distanceNorm = Math.round(distance / eventsMinLapse) + 2;
      timelineEventsArray[i].nativeElement.style.left = distanceNorm * min + 'px';
      // span
      let span = timelineEventsArray[i].nativeElement.parentElement.children[1];
      let aWidth = HorizontalTimelineComponent.getElementWidth(timelineEventsArray[i].nativeElement);
      let spanWidth = HorizontalTimelineComponent.getElementWidth(span);
      span.style.left = distanceNorm * min + (aWidth - spanWidth) / 2 + 'px';
      i++;
    }
  }
}
