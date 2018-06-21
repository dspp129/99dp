<template>
    <div style="width:100%;height:100%;"  :id="id"></div>
</template>

<script>
import echarts from 'echarts';

export default {
    name: 'dataSourcePie',
    props: {
        loading: {
            type: Boolean,
            default: true
        },
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
            id: Math.random().toString(36).substr(2),
            echart: Object,
            green: 0,
            red: 0
        };
    },
    methods: {
        init() {
            this.echart = echarts.init(document.getElementById(this.id));
        },
        refresh(){
            this.$nextTick(() => {
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
                                {value: this.green, name: '成功', itemStyle: {normal: {color: '#64D572'}}},
                                {value: this.red, name: '失败', itemStyle: {normal: {color: '#ed3f14'}}}
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
                this.echart.setOption(option);
                this.echart.resize();
            });
        }
    },
    mounted () {
        this.init()
        this.refresh()
    },
    watch : {
        loading(loading){
            if(loading){
                this.echart.showLoading();
            } else {
                setTimeout(() => {
                    this.echart.hideLoading();
                }, 1000);
            }
        },
        success(success){
            this.green = success
            this.refresh()
        },
        failure(failure){
            this.red = failure
            this.refresh()
        }
    }
};
</script>
