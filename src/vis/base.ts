import G2, { Chart } from '@antv/g2';
import { Record } from '../interfaces';

export interface BaseChartProps {
    container: HTMLDivElement;
    data: Record[];
    width?: number;
    height?: number;
    baseColor?: string;
}
export class BaseChart {
    public static seriesLength: number = 100;
    public static dimCode: string = 'dim';
    public static meaCode: string = 'mea';
    protected index: number;
    protected container: HTMLDivElement;
    protected chart: Chart;
    protected data: Record[];
    protected baseColor: string;
    public constructor (props: BaseChartProps) {
        this.container = props.container;
        this.index = 0;
        this.data = [];
        for (let i = 0; i < props.data.length; i++) {
            // this.appendPureData(props.data[i]);
            this.appendRecord(props.data[i])
        }
        this.chart = new Chart({
            container: props.container,
            height: props.height || 200,
            width: props.width || 400,
            padding: [20, 20, 20, 20],
        });
        this.baseColor = props.baseColor || "#64dfdf";
    }

    public spec () {
        const vis = this.chart;
        vis.data(this.data);

        vis.line().position([BaseChart.dimCode, BaseChart.meaCode]).shape('smooth').color(this.baseColor).style({
            shadowColor: this.baseColor,
            shadowBlur: 16,
            shadowOffsetX: 2,
            shaodowOffsetY: 20,
        });
        vis.tooltip(false);
        vis.axis(false);
        // vis.coord("polar", {
        //     innerRadius: 0.4,
        // });
        vis.animate(false);
        vis.legend(false);
    }
    public draw() {
        this.spec();
        this.chart.render();
    }
    public appendRecord(record: Record) {
        this.data.push(record);
    }
    private appendPureData (data: number) {
        this.data.push({
            [BaseChart.dimCode]: this.index + "",
            [BaseChart.meaCode]: data,
            index: this.index,
        });
        this.index++;
        if (this.index > BaseChart.seriesLength) {
            this.data.shift();
        }
    }
    public append(data: number) {
        this.appendPureData(data);
        this.chart.changeData(this.data);
    }
}
