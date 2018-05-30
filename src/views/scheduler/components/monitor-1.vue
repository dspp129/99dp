<template>
    <div style="min-height: 400px;">
        <Row>
            <div style="float: left;">
                <Select
                    v-model="execType"
                    ref="execType"
                    @on-change="resetCurrent"
                    clearable
                    placeholder="执行方式"
                    style="width:100px">
                    <Option v-for="item in execTypeList" :value="item.id" :key="item.id">{{item.name}}</Option>
                </Select>
                <Select
                    v-model="currentStatus"
                    ref="currentStatus"
                    @on-change="resetCurrent"
                    clearable
                    label-in-value
                    placeholder="运行状态"
                    style="width:100px">
                    <Option :value="-1" label="　等　待"></Option>
                    <Option :value="1" label="　执　行"></Option>
                    <Option :value="2" label="　成　功"></Option>
                    <Option :value="3" label="　失　败"></Option>
                    <Option :value="4" label="　被　杀"></Option>
                    <Option :value="5" label="　超　时"></Option>
                </Select>
                <DateRangePicker @on-date-change="onDateChange" :placement="'bottom-start'"></DateRangePicker>
                <Button type="ghost" shape="circle" icon="refresh" @click="resetCurrent"></Button>
            </div>
            <div style="float: left; margin-left: 10px">
                <Pagination 
                    :current="current"
                    :total="total"
                    :size="size"
                    @on-size-change="onSizeChange"
                    @on-current-change="onCurrentChange">
                </Pagination>
            </div>
        </Row>

        <Row class="margin-top-10">

            <Tabs size="small" >
                <TabPane label="调度列表" name="name1">
                    <Table stripe :columns="columnList" :data="taskList" size="small"></Table>
                </TabPane>
                <TabPane label="趋势分析" name="name2">
                    <Card>
                        <p slot="title">
                        <Icon type="stats-bars"></Icon>
                            时间趋势
                        </p>
                        <div style="height: 300px;">
                            <TimeTrend :dateRange="dateRange" :data="trendData"></TimeTrend>
                        </div>
                    </Card>

                    <Card class="margin-top-10">
                        <p slot="title">
                        <Icon type="pie"></Icon>
                            成功率
                        </p>
                        <div style="height: 300px;">
                            <SuccessRatePie :data="pieData"></SuccessRatePie>
                        </div>
                    </Card>
                </TabPane>
            </Tabs>
        </Row>
    </div>
</template>

<script>

const reviewButton = (vm, h, currentRowData) =>{
    return h('Button', {
        props: {
            type: 'info',
            size: 'small',
            icon: 'search',
            shape: 'circle'
        },
        on: {
            click: () => {
                const argu = { id: currentRowData.recordId };
                vm.$router.push({
                    name: 'monitor',
                    params: argu
                });
            }
        }
    })
};

const playButton = (vm, h, currentRowData, index) =>{
    return h('Button', {
        props: {
            type: 'ghost',
            size: 'small',
            icon: 'play',
            shape: 'circle',
        },
        style: {
            marginLeft: '10px'
        },
        on: {
            click: () => {
                
            }
        }
    })
};


const initColumnList = [
    {
        key: 'command',
        title: '执行命令',
        ellipsis: true
    },
    {
        key: 'execType',
        title: '执行方式',
        align: 'center',
        width: 90
    },
    {
        key: 'startTime',
        title: '开始时间',
        align: 'center',
        width: 150
    },
    {
        key: 'durationTime',
        title: '运行时长',
        align: 'center',
        width: 120
    },
    {
        key: 'success',
        title: '运行状态',
        align: 'center',
        width: 100
    },
    {
        key: 'operation',
        title: '操作',
        align: 'center',
        width: 110
    }
];


import Pagination from '../../my-components/pagination'
import DateRangePicker from '../../my-components/dateRangePicker'
import TimeTrend from '../../my-components/timeTrend'
import SuccessRatePie from '../../my-components/successRatePie'
import moment from 'moment'

export default {
    name: 'monitor-1',
    components: {
        Pagination,
        DateRangePicker,
        TimeTrend,
        SuccessRatePie
    },
    props :{
        value: Object
    },
    data () {
        return {

            startDate:'',
            endDate:'',
            dateRange:[],
            trendData: [],
            pieData: [],

            currentStatus: '',
            total: 0,
            current: 1,
            size: 10,

            columnList: [],
            taskList: [],
            userList: [],

            execType: '',
            execTypeList:[]

        };
    },
    methods: {
        init () {
            this.columnList = initColumnList
            this.columnList.forEach(item => {

                if (item.key === 'execType') {
                    item.render = (h, param) => {
                        const currentRowData = this.taskList[param.index]
                        switch(currentRowData.execType) {
                            case 0: return h('Tag', {props:{color:'green'}}, '自 动');
                            case 1: return h('Tag', {props:{color:'blue'}}, '手 动');
                            case 2: return h('Tag', {props:{color:'yellow'}}, '手 动'); // 调用api
                            case 3: return h('Tag', {props:{color:'default'}}, '重 跑');
                            case 4: return h('Tag', {props:{color:'default'}}, '现 场');
                            case 5: return h('Tag', {props:{color:'default'}}, '强 制');
                            default : return h('Tag', {props:{color:'green'}}, '自 动');
                        }
                    };
                }

                // 0-未调度, 1-等待中, 2-执行中, 3-成功, 4-失败, 5-超时被杀, 6-手动被杀
                if (item.key === 'success') {
                    item.render = (h, param) => {
                        const currentRowData = this.taskList[param.index]
                        switch(currentRowData.status) {
                            case -1: return h('Tag', {props:{color:'blue'}}, '等 待');
                            case 0: return h('Tag', {props:{color:'yellow'}}, '执 行');
                            case 2: return h('Tag', {props:{color:'red'}}, '停 止');
                        }
                        switch(currentRowData.success) {
                            case 0 : return h('Tag', {props:{color:'red'}}, '失 败') 
                            case 1 : return h('Tag', {props:{color:'green'}}, '成 功')
                            case 2 : return h('Tag', {props:{color:'red'}}, '强 制')
                            case 3 : return h('Tag', {props:{color:'#80848f'}}, '超 时')
                            case 4 : return h('Tag', {props:{color:'red'}},' 失 联')
                            default : return h('Tag', {props:{color:'default'}}, '未调度')
                            //case 6 : return h('Tag', {props:{color:'red'}}, '被 杀')
                        }
                    };
                }

                if (item.key === 'startTime') {
                    item.render = (h, param) => {
                        const currentRowData = this.taskList[param.index]
                        return h('span', this.dateTimeFormat(currentRowData.startTime))
                    };
                }

                if (item.key === 'durationTime') {
                    item.render = (h, param) => {
                        const currentRowData = this.taskList[param.index]
                        const durationTime = this.timeDiff(currentRowData.startTime, currentRowData.endTime)
                        return h('span', durationTime)
                    };
                }

                if (item.key === 'operation') {
                    item.render = (h, param) => {
                        const currentRowData = this.taskList[param.index]
                        return h('div', [
                            reviewButton(this, h, currentRowData),
                            playButton(this, h, currentRowData, param.index)
                        ]);
                    };
                }
            });
        },
        resetCurrent () {
            this.current = 1
            this.onSearch()
        },
        resetSearch () {
            this.keyWord = ''
            this.pagination.current = 1
        },
        onDateChange (date){
            if(date[0]===''){
                this.startDate = this.endDate = ''
            } else {
                this.startDate = this.dateFormat(date[0])
                this.endDate = this.dateFormat(date[1])
                this.loadECharts()
            }
            this.resetCurrent()
        },
        onSearch () {
            if(!this.value.jobId > 0) return;
            const page = this.current - 1
            let status = ''
            let success = ''
            switch(this.currentStatus){
                case -1: status = '-1'; break;
                case 1: status = '0'; break; // 执行 && success = 1
                case 2: success = '1'; break; // 成功
                case 3: success = '0'; break; // 失败 
                case 4: success = '2'; break; // 被杀 && success in (2,3)
                case 5: success = '3'; break;
            }
            this.$Loading.start()
            this.$http.get(`/api/monitor/list?size=${this.size}&page=${page}&status=${status}&success=${success}&startDate=${this.startDate}&endDate=${this.endDate}&taskId=${this.value.jobId}&execType=${this.execType}`).then(res => {
                const result = res.data
                if(result.code === 0){
                    this.$Loading.finish()
                    this.loadingPage = false
                    this.taskList = result.data.content
                    this.total = result.data.totalElements
                } else {
                    this.$Loading.error()
                    this.taskList = []
                    this.total = 0
                }

            })
        },
        loadECharts () {
            if(!this.value.jobId > 0) return;

            const dateRange = []
            let addDate = this.startDate
            while(addDate <= this.endDate){
                dateRange.push(addDate)
                addDate = moment(addDate).add(1, 'days').format('YYYY-MM-DD')
            }

            this.dateRange = dateRange

            this.$http.get(`/api/echarts/recordLine?taskId=${this.value.jobId}&startDate=${this.startDate}&endDate=${this.endDate}`).then(res => {
                const result = res.data
                if(result.code === 0){
                    this.trendData = result.data;
                }
            })

            this.$http.get(`/api/echarts/recordPie?taskId=${this.value.jobId}&startDate=${this.startDate}&endDate=${this.endDate}`).then(res => {
                const result = res.data
                if(result.code === 0){
                    this.pieData = result.data;
                }
            })
        },
        onSizeChange (size) {
            this.size = size
            this.current = 1
            this.onSearch()
        },
        onCurrentChange (current) {
            this.current = current
            this.onSearch()
        }
    },
    mounted () {
        this.init()
    },
    watch : {
        'value.jobId' (id){
            this.onSearch()
        }
    },
    created () {

        this.execTypeList = [
            {
                id: 0,
                name: '自 动'
            },
            {
                id: 1,
                name: '手 动'
            },
            {
                id: 2,
                name: '重 跑'
            },
            {
                id: 3,
                name: '现 场'
            }
        ]

    }
};
</script>

