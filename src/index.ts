import { setUpAnalyser } from './analysor';
import { BaseChart } from './vis/base';
import { LIGHT_SCHEME } from './constrants';
import { Beat } from './vis/beat';

const GROUP_SIZE = 40;

const cacheValues: number[][] = [];

const cacheRenderValues: number[][] = [];

for (let i = 0; i < 6; i++) {
    const segment = document.createElement('div');
    // segment.className = 'ui inverted segment';
    const div = document.createElement('div');
    div.id = 'chart-' + i;
    segment.appendChild(div)
    document.querySelector('#root')?.appendChild(segment);
}
const beatChartContainer1 = document.createElement('div');
beatChartContainer1.id = 'chart-vis-1';
const beatChartContainer2 = document.createElement("div");
beatChartContainer2.id = "chart-vis-2";

const labContainer = document.querySelector('#lab') as HTMLDivElement;

labContainer.appendChild(beatChartContainer1);
labContainer.appendChild(beatChartContainer2);

function main() {
    const player = document.querySelector("#player") as HTMLMediaElement;

    const analyser = setUpAnalyser(player);
    const chartList: BaseChart[] = [];
    // for (let  i = 0; i < 6; i++) {
    //     const container = document.querySelector('#chart-' + i) as HTMLDivElement;
    //     chartList.push(new BaseChart({ container, data: [0], baseColor: LIGHT_SCHEME[i % LIGHT_SCHEME.length] }))
    //     chartList[i].draw();
    // }

    const beatChart1 = new Beat({ container: beatChartContainer1, data: [0], width: 600, height: 600 })

    const beatChart2 = new Beat({ container: beatChartContainer2, data: [0], width: 600, height: 600 });
    beatChart1.draw();
    beatChart2.draw();

    function draw() {
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
            listBetter = (list.map((l, i) => Math.abs(l - mean[i])));
            cacheRenderValues.push(listBetter);
        }
        cacheValues.push(list);
        if (cacheValues.length > 10) {
            cacheValues.shift();
        }
        if (cacheRenderValues.length > 8) {
            cacheRenderValues.shift();
        }
        // for (let i = 0; i < 6; i++) {
        //     chartList[i].append(freqArray[i * 10] || 0);
        // }
        beatChart1.updateData(list)
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
            mean.forEach(v => {
                maxInMean = Math.max(v, maxInMean);
                minInMean = Math.min(v, minInMean);
            })
            for (let i = 0; i < mean.length; i++) {
                mean[i] = mean[i] / (maxInMean - minInMean)
            }
            let weightList = mean.map((v, i) => v * list[i] ** 2);
            let avgWeightList = [...weightList];
            for (let i = 0; i < weightList.length; i++) {
                avgWeightList[i] = (weightList[i] + (weightList[i - 1] || 0) + (weightList[i + 1] || 0)) / 3;
            }
            beatChart2.updateData(avgWeightList);
        } else {
            beatChart2.updateData(listBetter);
        }
        requestAnimationFrame(draw);
    }

    player.onplay = () => {
        console.log("play");
        requestAnimationFrame(draw);
    }
}

main();