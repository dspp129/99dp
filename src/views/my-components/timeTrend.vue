<template>
    <div style="width:100%;height:100%;" id="time_trend"></div>
</template>

<script>
import echarts from 'echarts'

export default {
    name: 'timeTrend',
    props :{
        dateRange: Array,
        title: String,
        data: Array
    },
    data () {
        return {
            chart: {},
        };
    },
    watch : {
        dateRange (val) {

            this.chart.setOption({
                xAxis: [{ data: val}]
            });
        },
        title (val) {
            this.chart.setOption({
                title: [{ text: val}]
            });
        },
        data (val) {
            this.chart.setOption({ series:  val });
        }
    },
    mounted () {
        // console.log(moment("2018-01-31").add(1, 'days').format('YYYY-MM-DD'));
    //    this.$nextTick(() => {
        this.chart = echarts.init(document.getElementById('time_trend'));
        const option = {
            title: {
                text: '' //折线图堆叠
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data:['成功','失败','被杀']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: true}, // 当readOnly为false时有bug 
                    saveAsImage: {}
                }
            },
            xAxis: {
                name : '日期',
                type: 'category',
                boundaryGap: false,
                data: []
            },
            yAxis: {
                name : '运行时长(秒)',
                type: 'value'
            },
            dataZoom: [
                {   // 这个dataZoom组件，默认控制x轴。
                    type: 'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
                    start: 0,      // 左边在 10% 的位置。
                    end: 100         // 右边在 60% 的位置。
                },
                {   // 这个dataZoom组件，也控制x轴。
                    type: 'inside', // 这个 dataZoom 组件是 inside 型 dataZoom 组件
                    start: 0,      // 左边在 10% 的位置。
                    end: 100         // 右边在 60% 的位置。
                }
            ],
            series: []
        };

        this.chart.setOption(option);

        window.addEventListener('resize', function () {
            this.chart.resize();
        });

    }
};
</script>
