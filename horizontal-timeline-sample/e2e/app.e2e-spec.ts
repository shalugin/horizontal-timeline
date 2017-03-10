import { HorizontalTimelineSamplePage } from './app.po';

describe('horizontal-timeline-sample App', function() {
  let page: HorizontalTimelineSamplePage;

  beforeEach(() => {
    page = new HorizontalTimelineSamplePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
