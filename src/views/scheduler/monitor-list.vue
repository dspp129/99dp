<style lang="less">
    @import '../../styles/common.less';
    @import './monitor-list.less';
</style>

<template>
    <div>
        <Spin fix v-if="loadingPage" size="large"></Spin>
        <Row>
            <transition name="openness-con">
                <div v-show="advancedQuery" class="openness-radio-con" >
                    <div style="margin-bottom: 10px;">
                         <Select
                            v-model="userId"
                            ref="userId"
                            @on-change="resetCurrent"
                            clearable
                            placeholder="负责人"
                            style="width:100px;">
                            <Option v-for="item in userList" :value="item.id" :key="item.id" :label="item.trueName"></Option>
                        </Select>
                        <DateRangePicker @on-date-change="onDateChange"></DateRangePicker>
                    </div>
                </div>
            </transition>
        </Row>
        <Row>
            <div style="float: left;">
               
                <Select
                    v-model="taskType"
                    ref="taskType"
                    @on-change="resetCurrent"
                    clearable
                    placeholder="任务类型"
                    style="width:100px">
                    <Option v-for="item in taskTypeList" :value="item.id" :key="item.id" :label="item.name"></Option>
                </Select>
                <Select
                    v-model="currentStatus"
                    ref="currentStatus"
                    @on-change="resetCurrent"
                    clearable
                    label-in-value
                    placeholder="运行状态"
                    style="width:100px">
                    <Option :value="1" label=" 执 行"></Option>
                    <Option :value="2" label=" 成 功"></Option>
                    <Option :value="3" label=" 失 败"></Option>
                    <Option :value="4" label=" 被 杀"></Option>
                </Select>
                <Input v-model="keyWord" placeholder="请输入调度名称..."
                    icon="search"
                    @on-click="resetCurrent"
                    @on-enter="resetCurrent"
                    style="width: 200px" />
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
            <div style="float: right;">
                <Button v-show="!advancedQuery" @click="openAdvancedQuery" type="primary" icon="chevron-down">高级查询</Button>
                <Button  v-show="advancedQuery" type="ghost" @click="closeAdvancedQuery" icon="chevron-up">收起</Button>
            </div>
        </Row>
        <Row class="margin-top-10">
            <Table stripe :columns="columnList" :data="taskList" size="small"></Table>
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
        style: {
            marginRight: '10px'
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
            marginRight: '10px'
        },
        on: {
            click: () => {
                
            }
        }
    })
};


const initColumnList = [
    {
        key: 'taskType',
        title: '任务类型',
        width: 110,
        ellipsis: true
    },
    {
        key: 'taskName',
        title: '调度名称',
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


import Pagination from '../my-components/pagination'
import DateRangePicker from '../my-components/dateRangePicker'
import Cookies from 'js-cookie'
import moment from 'moment'

export default {
    name: 'monitor-list',
    components: {
        Pagination,DateRangePicker
    },
    data () {
        return {
            loadingPage: false,
            advancedQuery: false,

            startDate:'',
            endDate:'',

            taskType: '',
            keyWord: '',
            userId : '',
            currentStatus: '',
            total: 0,
            current: 1,
            size: 10,

            columnList: [],
            taskList: [],
            userList: [],
            taskTypeList:[],
            taskTypeMap: new Map()

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
                            case 2: return h('Tag', {props:{color:'yellow'}}, '重 跑');
                            case 3: return h('Tag', {props:{color:'default'}}, '现 场');
                            default : return h('Tag', {props:{color:'green'}}, '自 动');
                        }
                    };
                }

                // 0-未调度, 1-等待中, 2-执行中, 3-成功, 4-失败, 5-超时被杀, 6-手动被杀
                if (item.key === 'success') {
                    item.render = (h, param) => {
                        const currentRowData = this.taskList[param.index]
                        if(currentRowData.status === 0) {
                            return h('Tag', {props:{color:'yellow'}}, '执 行');
                        }
                        switch(currentRowData.success) {
                            case 0 : return h('Tag', {props:{color:'red'}},'失 败') 
                            case 1 : return h('Tag', {props:{color:'green'}},'成 功')
                            case 2 : return h('Tag', {props:{color:'red'}},'强 制')
                            case 3 : return h('Tag', {props:{color:'#80848f'}},'超 时')
                            default : return h('Tag', {props:{color:'default'}},'未调度')
                            //case 6 : return h('Tag', {props:{color:'red'}},'被 杀')
                        }
                    };
                }

                if (item.key === 'taskType') {
                    item.render = (h, param) => {
                        const currentRowData = this.taskList[param.index]
                        return h('span', this.taskTypeMap.get(currentRowData.taskType))
                    };
                }

                if (item.key === 'startTime') {
                    item.render = (h, param) => {
                        const currentRowData = this.taskList[param.index]
                        return h('span', moment(currentRowData.startTime).format('YYYY-MM-DD HH:mm:ss'))
                    };
                }


                if (item.key === 'endTime') {
                    item.render = (h, param) => {
                        const currentRowData = this.taskList[param.index]
                        return h('span', moment(currentRowData.endTime).format('YYYY-MM-DD HH:mm:ss'))
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
        timeDiff(startTime, endTime){
            const start = moment(startTime)
            const end = endTime === null ? new Date() : moment(endTime)
            const du = moment.duration(end - start, 'ms')

            const days = du.get('days')
            const hours = du.get('hours')
            const minutes = du.get('minutes')
            const seconds = du.get('seconds')

            let txt = seconds+"秒"
            if(minutes > 0) txt =  minutes+"分"+ txt;
            if(hours > 0) txt =  hours+"小时"+ txt;
            if(days > 0) txt =  days+"天"+ txt;

            return txt;
        },
        openAdvancedQuery () {
            this.advancedQuery = true
        },
        closeAdvancedQuery () {
            this.advancedQuery = false
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
                this.startDate = moment(date[0]).format('YYYY-MM-DD')
                this.endDate = moment(date[1]).format('YYYY-MM-DD')
            }
            this.resetCurrent()
        },
        onSearch () {
            const page = this.current - 1
            let status = ''
            let success = ''
            switch(this.currentStatus){
                case 1: status = '0'; break; // 执行 && success = 1
                case 2: success = status = '1'; break; // 成功
                case 3: success = '0'; break; // 失败 
                case 4: status = '3'; break; // 被杀 && success in (2,3)
            }

            this.$Loading.start()
            this.$http.get(`/api/monitor/list?size=${this.size}&page=${page}&taskType=${this.taskType}&keyWord=${this.keyWord}&status=${status}&success=${success}&userId=${this.userId}&startDate=${this.startDate}&endDate=${this.endDate}`).then(res => {
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
        onSizeChange (size) {
            this.size = size
            this.current = 1
            this.onSearch()
        },
        onCurrentChange (current) {
            this.current = current
            this.onSearch()
        },
    },
    mounted () {
        
        this.init();

        this.$http.get('/api/task/userList').then(res => {
            const result = res.data
            if(result.code === 0){
                this.userList = result.data
                this.userId = Number(Cookies.get('userId'))
            }
        })
    },
    created () {
        this.loadingPage = true;
        this.$http.get(`/api/scheduler/taskType`).then(res => {
            const result = res.data
            if(result.code === 0){
                this.taskTypeList = result.data
                result.data.forEach(x => {
                    this.taskTypeMap.set(x.id, x.name)
                })
            }
        })
    }
};
</script>
