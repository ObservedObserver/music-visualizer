import { setUpAnalyser, IAnalyser } from "./analysor";
import { BaseChart } from "./vis/base";
import { LIGHT_SCHEME } from "./constrants";
import { Beat } from "./vis/beat";
import { MultiBeat } from './vis/multiBeat';
import { normalize } from "./utils";

const GROUP_SIZE = 40;

const cacheValues: number[][] = [];

const cacheRenderValues: number[][] = [];

for (let i = 0; i < 6; i++) {
    const segment = document.createElement("div");
    // segment.className = 'ui inverted segment';
    const div = document.createElement("div");
    div.id = "chart-" + i;
    segment.appendChild(div);
    document.querySelector("#root")?.appendChild(segment);
}
const beatChartContainer1 = document.createElement("div");
beatChartContainer1.id = "chart-vis-1";
const beatChartContainer2 = document.createElement("div");
beatChartContainer2.id = "chart-vis-2";

const labContainer = document.querySelector("#lab") as HTMLDivElement;

labContainer.appendChild(beatChartContainer1);
labContainer.appendChild(beatChartContainer2);
const beatChart1 = new MultiBeat({
    container: beatChartContainer1,
    data: [{dim: '1', mea: 1, color: 1}],
    width: 420,
    height: 420,
    color: 'color'
});

const beatChart2 = new MultiBeat({
    container: beatChartContainer2,
    data: [{ dim: "1", mea: 1, color: 1 }],
    width: 420,
    height: 420,
    color: 'color'
});
beatChart1.draw();
beatChart2.draw();
let analyserContainer: IAnalyser | null = null;
const chartList: BaseChart[] = [];
function main() {
    const player = document.querySelector("#player") as HTMLMediaElement;

    analyserContainer = setUpAnalyser(player);
    // chartList = [];
    for (let  i = 0; i < 6; i++) {
        const container = document.querySelector('#chart-' + i) as HTMLDivElement;
        chartList.push(new BaseChart({ container, data: [{dim: '0', mea: 0}], baseColor: LIGHT_SCHEME[i % LIGHT_SCHEME.length] }))
        chartList[i].draw();
    }
}
let counter = 0;
const info = document.querySelector('#info');
function draw(analyser: AnalyserNode) {
    // media.current.play()

    const freq = new Uint8Array(analyser.frequencyBinCount);
    // analyser.getByteTimeDomainData(freq);
    analyser.getByteFrequencyData(freq);
    const freqArray = Array.from(freq);
    // console.log(freq);
    let list: number[] = [];
    for (let i = 0; i < freqArray.length; i += GROUP_SIZE) {
        let sum: number = 0;
        for (let j = 0; j < GROUP_SIZE && i + j < freqArray.length; j++) {
            sum += freqArray[i + j];
        }
        // console.log(typeof sum)
        list.push(sum);
    }

    let listBetter: number[] = [...list];

    if (cacheValues.length > 0) {
        let mean = cacheValues[0].map(() => 0);
        for (let i = 0; i < cacheValues.length; i++) {
            for (let j = 0; j < mean.length; j++) {
                mean[j] += cacheValues[i][j];
            }
        }
        mean.forEach((v, i, arr) => {
            arr[i] /= cacheValues.length;
        });
        listBetter = list.map((l, i) => Math.abs(l - mean[i])).map(v => Math.sqrt(v + 2));
        cacheRenderValues.push(listBetter);
    }
    cacheValues.push(list);
    if (cacheValues.length > 10) {
        cacheValues.shift();
    }
    if (cacheRenderValues.length > 8) {
        cacheRenderValues.shift();
    }
    for (let i = 0; i < 6; i++) {
        chartList[i].append(freqArray[i * 10]);
    }
    beatChart1.updateData({ mea: list, color: list });
    if (cacheRenderValues.length > 0) {
        let mean = cacheValues[0].map(() => 0);
        for (let i = 0; i < cacheRenderValues.length; i++) {
            for (let j = 0; j < mean.length; j++) {
                mean[j] += cacheRenderValues[i][j];
            }
        }
        mean.forEach((v, i, arr) => {
            arr[i] /= cacheRenderValues.length;
        });
        let maxInMean: number = 0;
        let minInMean: number = Infinity;
        mean.forEach((v) => {
            maxInMean = Math.max(v, maxInMean);
            minInMean = Math.min(v, minInMean);
        });
        for (let i = 0; i < mean.length; i++) {
            mean[i] = mean[i] / (maxInMean - minInMean);
        }
        let weightList = mean.map((v, i) => v * list[i] ** 2);
        let avgWeightList = weightList.map(v => 0);
        // let colors = [...mean];
        for (let i = 0; i < weightList.length; i++) {
            for (let j = 0; j < 5; j++) {
                avgWeightList[i] += weightList[(i - 2 + j + weightList.length) % weightList.length] * (5 - Math.abs(j - 2)) ** 2
            }
            // avgWeightList[i] = 0.4 * weightList[i] + 0.4 * (weightList[(i - 1 + weightList.length) % weightList.length] || 0) + 0.4 * (weightList[(i + 1) % weightList.length] || 0);
            // colors[i] = 0.4 * mean[i] + 0.4 * (mean[i - 1] || 0) + 0.4 * (mean[i + 1] || 0);
        }
        beatChart2.updateData({ mea: avgWeightList, color: avgWeightList });
        // console.log(Math.round(listBetter.reduce((t, r) => t+ r)))
        info!.textContent = Math.round(listBetter.reduce((t, r) => t + r) / 100) * 100 + '';
    } else {
        beatChart2.updateData({ mea: listBetter, color: listBetter });
    }
    requestAnimationFrame(() => {
        draw(analyser);
    });
}

const p = document.querySelector("#player") as HTMLMediaElement;
// p.oncanplay = () => {
//     main();
//     console.log('loaded', analyser)
// };
// p.onsuspend = () => {
//     console.log('data loadeed')
// }
let animate: number = -1;
p.onplay = () => {
    if (!analyserContainer) {
        main();
    }
    console.log("play");
    animate = requestAnimationFrame(() => {
        if (analyserContainer) {
            draw(analyserContainer.analyser);
        }
    });
};

p.onpause = () => {
    if (analyserContainer) {
        // analyserContainer.source.disconnect();
        // analyserContainer.analyser.disconnect();
        // // analyserContainer.audioContext
        // analyserContainer = null;
        cancelAnimationFrame(animate)
    }
}