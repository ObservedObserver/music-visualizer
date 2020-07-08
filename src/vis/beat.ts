import { BaseChart, BaseChartProps } from "./base";
interface BeatChartProps extends BaseChartProps {
    container: HTMLDivElement;
    data: number[],
    baseColor?: string;
}
export class Beat extends BaseChart {
    constructor (props: BeatChartProps) {
        super(props);
    }
    public spec () {
        const vis = this.chart;
        vis.data(this.data);

        vis.interval()
            .position([BaseChart.dimCode, BaseChart.meaCode])
            // .shape("smooth")
            .size(10)
            .color(this.baseColor)
            .style({
                shadowColor: this.baseColor,
                shadowBlur: 16,
                shadowOffsetX: 2,
                shaodowOffsetY: 20,
            });
        vis.tooltip(false);
        vis.axis(false);
        vis.coord("polar", {
            innerRadius: 0.3,
        });
        vis.animate(false);
        vis.legend(false);
    }
    updateData (data: number[]) {
        const nextData = data.map((d, i) => ({
            [BaseChart.dimCode]: i + "",
            [BaseChart.meaCode]: d,
            index: i,
        }));
        this.data = nextData;
        this.chart.changeData(nextData);
    }
}