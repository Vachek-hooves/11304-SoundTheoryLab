#import <React/RCTBridgeModule.h>
#import <AVFoundation/AVFoundation.h>
@interface AudioLab : NSObject <RCTBridgeModule, AVAudioPlayerDelegate>
@property(nonatomic,strong) AVAudioRecorder *recorder;
@property(nonatomic,strong) AVAudioPlayer *player;
@property(nonatomic,copy) RCTPromiseResolveBlock playbackResolve;
@end
@implementation AudioLab
RCT_EXPORT_MODULE();
+ (BOOL)requiresMainQueueSetup { return YES; }
- (dispatch_queue_t)methodQueue { return dispatch_get_main_queue(); }
RCT_EXPORT_METHOD(start:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  [[AVAudioSession sharedInstance] requestRecordPermission:^(BOOL granted) {
    dispatch_async(dispatch_get_main_queue(), ^{
      if (!granted) { reject(@"permission", @"Microphone access is disabled. Enable it in Settings to record.", nil); return; }
      NSError *error;
      AVAudioSession *session = [AVAudioSession sharedInstance];
      [session setCategory:AVAudioSessionCategoryPlayAndRecord withOptions:AVAudioSessionCategoryOptionDefaultToSpeaker error:&error];
      [session setActive:YES error:&error];
      if (error) { reject(@"session", error.localizedDescription, error); return; }
      NSString *path = [NSTemporaryDirectory() stringByAppendingPathComponent:[NSString stringWithFormat:@"bass-%@.wav", NSUUID.UUID.UUIDString]];
      NSDictionary *settings = @{AVFormatIDKey:@(kAudioFormatLinearPCM), AVSampleRateKey:@22050, AVNumberOfChannelsKey:@1, AVLinearPCMBitDepthKey:@16, AVLinearPCMIsBigEndianKey:@NO, AVLinearPCMIsFloatKey:@NO};
      self.recorder = [[AVAudioRecorder alloc] initWithURL:[NSURL fileURLWithPath:path] settings:settings error:&error];
      self.recorder.meteringEnabled = YES;
      if (error || ![self.recorder recordForDuration:15]) { reject(@"record", @"Could not start recording.", error); return; }
      resolve(path);
    });
  }];
}
RCT_EXPORT_METHOD(level:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  [self.recorder updateMeters];
  resolve(@{ @"level": self.recorder ? @(pow(10, [self.recorder averagePowerForChannel:0] / 20)) : @0, @"seconds": self.recorder ? @(self.recorder.currentTime) : @0 });
}
RCT_EXPORT_METHOD(stop:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  if (!self.recorder) { reject(@"record", @"No recording is active.", nil); return; }
  NSString *path = self.recorder.url.path;
  [self.recorder stop]; self.recorder = nil;
  resolve(@{ @"path":path, @"raw":@NO, @"sampleRate":@22050 });
}
RCT_EXPORT_METHOD(play:(NSString *)path resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  [self.player stop]; if (self.playbackResolve) { self.playbackResolve(@NO); self.playbackResolve = nil; }
  NSError *error;
  [[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategoryPlayback error:&error];
  [[AVAudioSession sharedInstance] setActive:YES error:&error];
  self.player = [[AVAudioPlayer alloc] initWithContentsOfURL:[NSURL fileURLWithPath:path] error:&error];
  self.player.delegate = self;
  if(error || ![self.player play]) { reject(@"play", @"Could not play recording.", error); return; }
  self.playbackResolve = resolve;
}
- (void)audioPlayerDidFinishPlaying:(AVAudioPlayer *)player successfully:(BOOL)flag { if (self.playbackResolve) { self.playbackResolve(@(flag)); self.playbackResolve = nil; } }
RCT_EXPORT_METHOD(stopPlayback) { [self.player stop]; self.player = nil; if (self.playbackResolve) { self.playbackResolve(@NO); self.playbackResolve = nil; } }
RCT_EXPORT_METHOD(cancel) { [self.recorder stop]; [self.recorder deleteRecording]; self.recorder = nil; [self stopPlayback]; }
@end
