export const chromeOptions = {
  animations: {
    startEnter: 'slide_in_right',
    startExit: 'slide_out_left',
    endEnter: 'slide_in_right',
    endExit: 'slide_out_left',
  },
  headers: {
    'my-custom-header': 'my custom header value',
  },
  showTitle: false,
  enableUrlBarHiding: true,
  enableDefaultShare: false,
  showProgressBar: false,
  toolbarColor: '#000000',
  secondaryToolbarColor: '#000000',
  navigationBarColor: '#000000',
  navigationBarDividerColor: '#000000',
  hasBackButton: true,
  dismissButtonStyle: 'close',
  showInRecents: true,
  forceCloseOnRedirection: false,
  includeReferrer: true,
};
