export function setUpAnalyser(player: HTMLMediaElement): AnalyserNode {
    const audioContext = new window.AudioContext();
    audioContext.resume();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(player);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 2 ** 12;
    return analyser;
}