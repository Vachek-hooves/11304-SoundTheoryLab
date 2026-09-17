import { useLayout, useResponsiveStyles } from '../hooks/useLayout';
import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientSurface as LinearGradient } from '../components/GradientSurface';
import { WebView } from 'react-native-webview';
import { Entrance } from '../components/Entrance';
import { Button } from '../components/UI';
import { colors } from '../theme';
import { useAppState } from '../state/AppState';
const loaderHTML = `<html><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;background:transparent;color:#9a9c8c;font:9px monospace;letter-spacing:2px}.track{height:2px;background:#39413b;margin-bottom:12px}.fill{height:2px;width:0;background:linear-gradient(90deg,#f6d48a,#16d3bd);animation:load 4s linear forwards}@keyframes load{to{width:100%}}</style><div class="track"><div class="fill"></div></div>CALIBRATING ACOUSTIC<br>ENGINE…<script>setTimeout(()=>window.ReactNativeWebView.postMessage('complete'),4000)</script></html>`;
export function Loader({ onDone }: { onDone: () => void }) {
  const s = useResponsiveStyles();
  const layout = useLayout();
  return (
    <ImageBackground
      source={require('../assets/Loader (1).png')}
      style={{ flex: 1, backgroundColor: '#000' }}
      resizeMode="cover"
    >
      <View
        style={{
          flex: 1,
          backgroundColor: '#0009',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          source={require('../assets/Rectangle 5.png')}
          style={{
            width: Math.min(layout.width * 0.76, 330),
            height: Math.min(layout.availableHeight * 0.34, 265),
          }}
          resizeMode="contain"
        />
        <Text style={[s.title, { color: colors.gold, marginTop: 14 }]}>
          Big Sound
        </Text>
        <Text style={[s.label, { letterSpacing: 5, marginTop: 8 }]}>
          BASS TOOLKIT
        </Text>
        <View style={{ width: 190, height: 64, marginTop: 30 }}>
          <WebView
            source={{ html: loaderHTML }}
            originWhitelist={['*']}
            scrollEnabled={false}
            style={{ backgroundColor: 'transparent' }}
            onMessage={event =>
              event.nativeEvent.data === 'complete' && onDone()
            }
            onError={onDone}
          />
        </View>
      </View>
    </ImageBackground>
  );
}
const pages = [
  {
    image: require('../assets/image 2.png'),
    eyebrow: 'LEARN THE THEORY',
    title: 'Sound, made legible',
    body: 'Structured modules take you from pressure waves to room modes — with the maths shown.',
  },
  {
    image: require('../assets/image 2 (1).png'),
    eyebrow: 'TOOLS THAT ANSWER',
    title: 'Formulas you can run',
    body: 'A searchable formula library and glossary wired straight into a calculator for frequency, wavelength, dB and tempo.',
  },
  {
    image: require('../assets/image 2 (2).png'),
    eyebrow: 'EXPERIMENT',
    title: 'Simulate and reverse',
    body: 'Run repeated signal trials to see how values scatter, then play the reverse-speech game to train your ear.',
  },
];
export function Onboarding() {
  const s = useResponsiveStyles();
  const [index, setIndex] = useState(0);
  const { update } = useAppState();
  const layout = useLayout();
  const insets = useSafeAreaInsets();
  const done = () => update(v => ({ ...v, onboarded: true }));
  const page = pages[index];
  return (
    <View style={{ flex: 1, backgroundColor: '#000', paddingTop: insets.top }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          paddingBottom: 16,
        }}
      >
        <Pressable
          accessibilityRole="button"
          onPress={done}
          style={{
            alignSelf: 'flex-end',
            paddingHorizontal: layout.gutter,
            paddingVertical: layout.compact ? 12 : 22,
            minHeight: 44,
          }}
        >
          <Text style={s.muted}>Skip</Text>
        </Pressable>
        <Entrance style={{ alignItems: 'center' }} animationKey={index}>
          <View>
            <Image
              source={page.image}
              resizeMode="contain"
              style={{
                width: layout.heroSize,
                height: layout.heroSize,
              }}
            />
            <LinearGradient
              colors={['transparent', '#000']}
              style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                height: 70,
              }}
            />
          </View>
          <View
            style={{
              paddingHorizontal: layout.gutter,
              paddingTop: layout.compact ? 12 : 28,
              alignItems: 'center',
              gap: layout.compact ? 10 : 14,
            }}
          >
            <Text style={s.label}>{page.eyebrow}</Text>
            <Text
              style={[
                s.title,
                { fontSize: layout.compact ? 23 : 26, textAlign: 'center' },
              ]}
            >
              {page.title}
            </Text>
            <Text
              style={[
                s.muted,
                {
                  textAlign: 'center',
                  fontSize: 15,
                  lineHeight: layout.compact ? 22 : 24,
                  maxWidth: 350,
                },
              ]}
            >
              {page.body}
            </Text>
          </View>
        </Entrance>
        <View
          style={{
            paddingHorizontal: layout.gutter,
            paddingTop: layout.compact ? 18 : 32,
            gap: layout.compact ? 14 : 22,
          }}
        >
          <View style={[s.row, { justifyContent: 'center', gap: 6 }]}>
            {pages.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === index ? 25 : 5,
                  height: 5,
                  borderRadius: 4,
                  backgroundColor: i === index ? colors.teal : '#323431',
                }}
              />
            ))}
          </View>
          <Button
            title={index === 2 ? 'Get Started   →' : 'Continue   →'}
            onPress={() => (index === 2 ? done() : setIndex(index + 1))}
          />
        </View>
      </ScrollView>
      <View style={{ height: insets.bottom }} />
    </View>
  );
}
