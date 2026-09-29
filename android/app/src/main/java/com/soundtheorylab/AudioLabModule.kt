package com.soundtheorylab

import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaPlayer
import android.media.MediaRecorder
import com.facebook.react.bridge.*
import com.facebook.react.ReactPackage
import com.facebook.react.uimanager.ViewManager
import java.io.File
import java.io.FileOutputStream
import kotlin.math.abs

class AudioLabModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
    private var recorder: AudioRecord? = null
    private var player: MediaPlayer? = null
    private var playback: Promise? = null
    private var worker: Thread? = null
    private var file: File? = null
    @Volatile private var active = false
    @Volatile private var amplitude = 0.0
    @Volatile private var frames = 0
    override fun getName() = "AudioLab"
    @ReactMethod fun start(promise: Promise) {
        try {
            stopPlayback()
            val minimum = AudioRecord.getMinBufferSize(22050, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT)
            val size = maxOf(4096, minimum)
            val audio = AudioRecord(MediaRecorder.AudioSource.MIC, 22050, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT, size)
            if (audio.state != AudioRecord.STATE_INITIALIZED) { audio.release(); throw IllegalStateException("Microphone unavailable") }
            file = File(context.cacheDir, "bass-${System.nanoTime()}.pcm")
            val output = FileOutputStream(file!!)
            recorder = audio
            frames = 0
            active = true
            audio.startRecording()
            worker = Thread {
                val buffer = ShortArray(size / 2)
                try {
                    output.use { stream ->
                        while (active && frames < 22050 * 15) {
                            val count = audio.read(buffer, 0, buffer.size)
                            if (count <= 0) break
                            val bytes = ByteArray(count * 2)
                            var peak = 0
                            for (i in 0 until count) {
                                val sample = buffer[i].toInt()
                                bytes[i * 2] = sample.toByte()
                                bytes[i * 2 + 1] = (sample shr 8).toByte()
                                peak = maxOf(peak, abs(sample))
                            }
                            amplitude = peak / 32768.0
                            frames += count
                            stream.write(bytes)
                        }
                    }
                } finally { active = false }
            }.also { it.start() }
            promise.resolve(file!!.absolutePath)
        } catch (e: Exception) { active = false; recorder?.release(); recorder = null; promise.reject("record", e.message, e) }
    }
    @ReactMethod fun level(promise: Promise) { promise.resolve(Arguments.createMap().apply { putDouble("level", amplitude); putDouble("seconds", frames / 22050.0) }) }
    @ReactMethod fun stop(promise: Promise) {
        try {
            active = false
            recorder?.stop()
            worker?.join(2000)
            recorder?.release()
            recorder = null
            val path = file ?: throw IllegalStateException("No recording is active")
            promise.resolve(Arguments.createMap().apply { putString("path", path.absolutePath); putBoolean("raw", true); putInt("sampleRate", 22050) })
        } catch (e: Exception) { promise.reject("record", e.message, e) }
    }
    @ReactMethod fun play(path: String, promise: Promise) {
        try {
            stopPlayback()
            player = MediaPlayer().apply {
                setDataSource(path)
                setOnCompletionListener { stopPlayback() }
                setOnErrorListener { _, _, _ -> playback?.reject("play", "Playback failed"); playback = null; stopPlayback(); true }
                prepare()
                playback = promise
                start()
            }
        } catch (e: Exception) { promise.reject("play", e.message, e) }
    }
    @ReactMethod fun stopPlayback() { player?.release(); player = null; playback?.resolve(true); playback = null }
    @ReactMethod fun cancel() { active = false; try { recorder?.stop(); worker?.join(2000) } catch (_: Exception) {} ; recorder?.release(); recorder = null; file?.delete(); stopPlayback() }
    override fun invalidate() { cancel(); super.invalidate() }
}
class AudioLabPackage : ReactPackage {
    override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> = listOf(AudioLabModule(context))
    override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
