Pod::Spec.new do |s|
  s.name = 'AudioLab'
  s.version = '1.0.0'
  s.summary = 'Local PCM recording and playback for Big Sound'
  s.homepage = 'https://localhost/AudioLab'
  s.license = 'MIT'
  s.author = 'Big Sound'
  s.platform = :ios, '15.1'
  s.source = { :git => '' }
  s.source_files = 'AudioLab.m'
  s.frameworks = 'AVFoundation'
  s.dependency 'React-Core'
end
