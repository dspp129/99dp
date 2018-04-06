<template>
    <div style="width:100%;height:100%;" id="success_rate_pie"></div>
</template>

<script>
import echarts from 'echarts'

export default {
    name: 'successRatePie',
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
            this.chart.setOption({ series:  [{ data: val}] });
        }
    },
    mounted () {
        // console.log(moment("2018-01-31").add(1, 'days').format('YYYY-MM-DD'));
    //    this.$nextTick(() => {
        this.chart = echarts.init(document.getElementById('success_rate_pie'), 'light');
        const option = {
            title : {
                text: '',
                subtext: '',
                x:'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: ['成功','失败','被杀']
            },
            series : [
                {
                    name: '执行结果',
                    type: 'pie',
                    radius :  [0, '65%'] ,
                    center: ['50%', '60%'],
                    data:[],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };

        this.chart.setOption(option);

        //window.addEventListener('resize', function () {
            this.chart.resize();
        //});

    }
};
</script>
