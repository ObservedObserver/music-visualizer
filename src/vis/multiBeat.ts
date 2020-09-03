import { BaseChart, BaseChartProps } from "./base";
import { Record } from '../interfaces';

interface BeatChartProps extends BaseChartProps {
    container: HTMLDivElement;
    data: Record[];
    baseColor?: string;
    color?: string;
}
export class MultiBeat extends BaseChart {
    private color: string;
    private cache: Record[];
    private counter: number;
    constructor(props: BeatChartProps) {
        super(props);
        this.color = props.color || '';
        this.cache = [];
        this.counter = 0;
    }
    public spec() {
        const vis = this.chart;
        vis.data(this.data);

        vis.interval()
            .position([BaseChart.dimCode, BaseChart.meaCode])
            .shape("smooth")
            // .size(this.color)
            .color(this.color, [
                "#7400b8",
                "#80ffdb",
            ])
            .size(8)
            // .adjust('stack')
            // .style({
            //     fillOpacity: 0.6
            //     // shadowColor: "rgba(255, 255, 255, 0.52)", //this.baseColor,
            //     // shadowBlur: 16,
            //     // shadowOffsetX: 2,
            //     // shaodowOffsetY: 20,
            //     // borderColor: 
            // });
        vis.tooltip(false);
        vis.axis(false);
        vis.coord("polar", {
            innerRadius: 0.3,
        });
        vis.animate(false);
        vis.legend(false);
    }
    updateData(data: {[key: string]: number[]}) {
        const colorField = this.color;
        const nextData: Record[] = [];
        const keys = Object.keys(data);
        const size = data[keys[0]].length;
        // const tmp =
        //     this.cache.length > 0
        //         ? this.cache[0][BaseChart.meaCode]
        //         : data[BaseChart.meaCode][0];
        this.counter ++;
        const counter = Math.round(this.counter / 6)
        for (let i = 0; i < size; i++) {
            let record: Record = {
                [BaseChart.dimCode]: i + "",
                [colorField]: counter % 12, //data[colorField][(i + counter) % size],
                [colorField]: data[colorField][(i + counter) % size],
                [BaseChart.meaCode]: data[BaseChart.meaCode][i], //data[BaseChart.meaCode][(i + counter) % size],
                index: i,
            };
            // keys.forEach(k => {
            //     record[k] = data[k][i];
            // })
            nextData.push(record);
        }
        this.data = nextData;
        // this.cache.push(...nextData);
        // if (this.cache.length > size * 12) {
        //     this.cache.splice(0, size);
        // }
        this.chart.changeData(this.data);
    }
}
