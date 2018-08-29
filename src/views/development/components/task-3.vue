<template>
    <div style="min-height: 400px;">
        <Row>
            <div style="float: left;">
                <Select
                    v-model="execType"
                    ref="execType"
                    @on-change="resetSearch"
                    clearable
                    placeholder="执行方式"
                    style="width:100px">
                    <Option v-for="item in execTypeList" :value="item.id" :key="item.id">{{item.name}}</Option>
                </Select>
                <Select
                    v-model="currentStatus"
                    ref="currentStatus"
                    @on-change="resetSearch"
                    clearable
                    label-in-value
                    placeholder="运行状态"
                    style="width:100px">
                    <Option :value="-1" label="　等　待"></Option>
                    <Option :value="1" label="　执行中"></Option>
                    <Option :value="2" label="　成　功"></Option>
                    <Option :value="3" label="　失　败"></Option>
                    <Option :value="4" label="　被　杀"></Option>
                    <Option :value="5" label="　超　时"></Option>
                </Select>
                <DateRangePicker @on-date-change="onDateChange" :placement="'bottom-start'"></DateRangePicker>
                <Button type="primary" shape="circle" icon="search" @click="startSearch" :loading="loadingTable"></Button>
                <Button type="ghost" shape="circle" icon="loop" @click="resetFilter"></Button>
            </div>
        </Row>


        <Row class="margin-top-10">
            <!--
            <Tabs size="small" >
                <TabPane label="调度列表" name="name1">
                -->
                    <TablePagination :total="total" :size="filter.size" @on-page-info-change="changePageInfo">
                        <Table stripe :columns="columnList" :data="taskList" size="small" slot="table" :loading="loadingTable"></Table>
                    </TablePagination>
                    <!--
                </TabPane>
                <TabPane label="趋势分析" name="name2">
                    <Card icon="stats-bars" title="时间趋势">
                        <div style="height: 300px;">
                            <TimeTrend :dateRange="dateRange" :data="trendData"></TimeTrend>
                        </div>
                    </Card>
                    <Card icon="pie" title="成功率" class="margin-top-10">
                        <div style="height: 300px;">
                            <SuccessRatePie :data="pieData"></SuccessRatePie>
                        </div>
                    </Card>
                </TabPane>
            </Tabs>
        -->
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
                    name: 'record',
                    params: argu
                });
                vm.$emit('input', currentRowData.recordId)
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
        width: 160
    },
    {
        key: 'durationTime',
        title: '运行时长',
        align: 'center',
        width: 160
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

import TablePagination from '@/views/my-components/tablePagination';
import DateRangePicker from '@/views/my-components/dateRangePicker';
import TimeTrend from '@/views/my-components/timeTrend';
import SuccessRatePie from '@/views/my-components/successRatePie';
import moment from 'moment';
import Util from '@/libs/util';

export default {
    name: 'task-3',
    components: {
        TablePagination,
        DateRangePicker,
        TimeTrend,
        SuccessRatePie
    },
    props :{
        id: Number
    },
    data () {
        return {
            loadingTable: false,
            enableSearch: false,

            startDate:'',
            endDate:'',
            dateRange:[],
            trendData: [],
            pieData: [],

            currentStatus: '',

            total:0,
            filter:{
                page: 1,
                size: 10
            },

            columnList: [],
            taskList: [],

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
                            case 2 : return h('Tag', {props:{color:'red'}}, '被 杀')
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
                        return h('span', Util.formatDateTime(currentRowData.startTime))
                    };
                }

                if (item.key === 'durationTime') {
                    item.render = (h, param) => {
                        const currentRowData = this.taskList[param.index]
                        const durationTime = Util.timeDiff(currentRowData.startTime, currentRowData.endTime)
                        return h('span', durationTime)
                    };
                }

                if (item.key === 'operation') {
                    item.render = (h, param) => {
                        const currentRowData = this.taskList[param.index]
                        return h('div', [
                            reviewButton(this, h, currentRowData),
                            //playButton(this, h, currentRowData, param.index)
                        ]);
                    };
                }
            });
        },
        resetSearch () {
            this.filter.page = 1
            this.getData()
        },
        resetFilter () {
            this.currentStatus = ''
        },
        changePageInfo(filter) {
            this.filter = filter;
            this.getData()
        },
        onDateChange (date){
            if(date[0]===''){
                this.startDate = this.endDate = ''
            } else {
                this.startDate = Util.formatDate(date[0])
                this.endDate = Util.formatDate(date[1])
                //this.loadECharts()
            }
            this.resetSearch()
        },
        startSearch () {
            this.enableSearch = true
            this.getData()
        },
        getData () {
            if(!this.enableSearch) return;

            const taskId = Util.formatNumber(this.id)
            if(taskId < 0) return;

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

            const reg = /^[0-9]+$/
            if(!reg.test(this.execType)){
                this.execType = ''
            }

            const page = this.filter.page
            const size = this.filter.size

            this.loadingTable = true
            this.getRequest(`/monitor/list?size=${size}&page=${page}&status=${status}&success=${success}&startDate=${this.startDate}&endDate=${this.endDate}&taskId=${taskId}&execType=${this.execType}`).then(res => {
                const result = res.data
                this.loadingTable = false

                if(result.code === 0){
                    this.taskList = result.data.content
                    this.total = result.data.totalElements
                } else {
                    this.taskList = []
                    this.total = 0
                }

            })
        },
        loadECharts () {
            if(!this.enableSearch) return;

            const taskId = Util.formatNumber(this.id)
            if(taskId < 0) return;

            const dateRange = []
            let addDate = this.startDate
            while(addDate <= this.endDate){
                dateRange.push(addDate)
                addDate = moment(addDate).add(1, 'days').format('YYYY-MM-DD')
            }

            this.dateRange = dateRange

            this.getRequest(`/echarts/recordLine?taskId=${taskId}&startDate=${this.startDate}&endDate=${this.endDate}`).then(res => {
                const result = res.data
                if(result.code === 0){
                    console.log(result.data)
                    this.trendData = result.data;
                }
            })

            this.getRequest(`/echarts/recordPie?taskId=${taskId}&startDate=${this.startDate}&endDate=${this.endDate}`).then(res => {
                const result = res.data
                if(result.code === 0){
                    this.pieData = result.data;
                }
            })
        },
        onCurrentChange (current) {
            this.current = current
            this.getData()
        }
    },
    mounted () {
        this.init()
    },
    watch : {
        id (){
            this.taskList = []
        }
    },
    created () {

        this.execTypeList = [
            {
                id: 0,
                name: '　自　动'
            },
            {
                id: 1,
                name: '　手　动'
            },
            {
                id: 2,
                name: '　重　跑'
            },
            {
                id: 3,
                name: '　现　场'
            }
        ]

    }
};
</script>

