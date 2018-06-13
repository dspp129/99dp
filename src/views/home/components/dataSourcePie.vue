<template>
    <div style="width:100%;height:100%;"  :id="id"></div>
</template>

<script>
import echarts from 'echarts';

export default {
    name: 'dataSourcePie',
    props: {
        success: {
            type: Number,
            default: 700
        },
        failure: {
            type: Number,
            default: 40
        }
    },
    data () {
        return {
            id: Math.random().toString(36).substr(2)
        };
    },
    mounted () {
        this.$nextTick(() => {
            var dataSourcePie = echarts.init(document.getElementById(this.id));
            const option = {
                title : {
                    text: '',
                    subtext: '',
                    x:'left'
                },
                tooltip : {
                    trigger: 'item',
                    formatter: "{b} : {c} ({d}%)"
                },
                legend: {
                    orient: 'vertical',
                    left: 'right',
                    data: ['成功','失败']
                },
                series: [
                    {
                        name: '',
                        type: 'pie',
                        radius: '66%',
                        center: ['50%', '60%'],
                        data: [
                            {value: this.success, name: '成功', itemStyle: {normal: {color: '#64D572'}}},
                            {value: this.failure, name: '失败', itemStyle: {normal: {color: '#ed3f14'}}}
                        ],
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
            dataSourcePie.setOption(option);
            window.addEventListener('resize', function () {
                dataSourcePie.resize();
            });
        });
    }
};
</script>
