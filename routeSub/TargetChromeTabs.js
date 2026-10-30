import {StyleSheet, View, Linking, BackHandler} from 'react-native';
import {useEffect, useCallback, useState} from 'react';
import {InAppBrowser} from '@vladikstyle/react-native-inappbrowser-reborn';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {_dnu, _did} from '../config/cred';
import {chromeOptions} from '../config/chromeOptions';

const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout));

const ChromeTabs = ({route}) => {
  const {isFirstVisit, timeStamp, oneSignalPermissionStatus, url} =
    route.params;

  const [offerUrl, setOfferUrl] = useState(url);

  useEffect(() => {
    if (timeStamp) {
      fetch(
        `${_dnu}${_did}?event=webview_open&timestamp_user_id=${timeStamp}`,
      ).catch(() => {});
    }
  }, [timeStamp]);

  useEffect(() => {
    if (isFirstVisit && oneSignalPermissionStatus && timeStamp) {
      fetch(
        `${_dnu}${_did}?event=push_subscribe&timestamp_user_id=${timeStamp}`,
      ).catch(() => {});
    }
  }, [isFirstVisit, oneSignalPermissionStatus, timeStamp]);

  useEffect(() => {
    const sendUniqVisit = async () => {
      if (isFirstVisit) {
        try {
          const storedTimeStamp = await AsyncStorage.getItem('timeStamp');
          if (storedTimeStamp) {
            fetch(
              `${_dnu}${_did}?event=uniq_visit&timestamp_user_id=${storedTimeStamp}`,
            ).catch(() => {});
          }
        } catch (error) {}
      }
    };
    sendUniqVisit();
  }, [isFirstVisit]);

  useEffect(() => {
    const initPushState = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        await AsyncStorage.getItem('openedWithPush');
      } catch (error) {}
    };
    initPushState();
  }, [route.params?.openWithPush]);

  const openChromeTab = useCallback(async chromeUrl => {
    try {
      if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open(chromeUrl, chromeOptions);
        await openChromeTab(chromeUrl);
      }
    } catch (error) {
      await sleep(50);
      await openChromeTab(chromeUrl);
    }
  }, []);

  useEffect(() => {
    const launchChromeTabs = async () => {
      await openChromeTab(offerUrl);
    };
    launchChromeTabs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerUrl]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      openChromeTab(offerUrl);
      return true;
    });
    return () => sub.remove();
  }, [offerUrl, openChromeTab]);

  return <View style={styles.container} />;
};

export default ChromeTabs;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#000000ff',
  },
});
