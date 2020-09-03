export interface IAnalyser {
    analyser: AnalyserNode;
    source: MediaElementAudioSourceNode;
    audioContext: AudioContext;
}
export function setUpAnalyser(player: HTMLMediaElement): IAnalyser {
    const audioContext = new window.AudioContext();
    audioContext.resume();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(player);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 2 ** 12;
    return {
        analyser,
        audioContext,
        source
    };
}