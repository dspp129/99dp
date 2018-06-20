<style lang="less">
    @import '../../styles/common.less';
    @import './monitor-list.less';
</style>

<template>
    <div>
        <Row>
            <transition name="openness-con">
                <div v-show="advancedQuery" class="openness-radio-con" >
                    <div style="margin-bottom: 10px;">
                         <Select
                            v-model="userId"
                            ref="userId"
                            @on-change="resetSearch"
                            clearable
                            placeholder="负责人"
                            style="width:100px;">
                            <Option v-for="item in userList" :value="item.id" :key="item.id">{{item.trueName}}</Option>
                        </Select>
                        <DateRangePicker @on-date-change="onDateChange" :placement="'bottom-start'"></DateRangePicker>
                    </div>
                </div>
            </transition>
        </Row>
        <Row>
            <div style="float: left;">
                <Select
                    v-model="taskType"
                    ref="taskType"
                    @on-change="resetSearch"
                    clearable
                    placeholder="任务类型"
                    style="width:100px">
                    <Option v-for="item in taskTypeList" :value="item.id" :key="item.id">{{item.name}}</Option>
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
                    <Option :value="1" label="　执　行"></Option>
                    <Option :value="2" label="　成　功"></Option>
                    <Option :value="3" label="　失　败"></Option>
                    <Option :value="4" label="　被　杀"></Option>
                    <Option :value="5" label="　超　时"></Option>
                </Select>
                <Input v-model="keyWord" placeholder="请输入调度名称..."
                    @on-enter="resetSearch"
                    style="width: 200px" />
                <Button type="primary" shape="circle" icon="search" @click="resetSearch"></Button>
                <Button type="ghost" shape="circle" icon="loop" @click="resetFilter"></Button>
            </div>
            <div style="float: right;">
                <Button v-show="!advancedQuery" @click="openAdvancedQuery" type="primary" icon="chevron-down">高级查询</Button>
                <Button  v-show="advancedQuery" type="ghost" @click="closeAdvancedQuery" icon="chevron-up">收起</Button>
            </div>
        </Row>
        <Row class="margin-top-10">
            <TablePagination ref="serverList" :total="total" :size="filter.size" @on-page-info-change="changePageInfo">
                <Table stripe 
                :columns="columnList" 
                :data="taskList" 
                :loading="loadingTable"
                size="small"
                slot="table"></Table>
            </TablePagination>
        </Row>
    </div>
</template>

<script>

import TablePagination from '@/views/my-components/tablePagination'
import DateRangePicker from '../my-components/dateRangePicker';
import Cookies from 'js-cookie';
import Util from '@/libs/util';

const reviewButton = (vm, h, currentRowData) => {
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

const playButton = (vm, h, currentRowData) =>{
    return h('Poptip', {
        props: {
            //information-circled
            confirm: true,
            title: '手动执行这个任务?',
            transfer: true,
            placement: 'top-end'
        },
        style: {
            marginLeft: '10px'
        },
        on: {
            'on-ok': () => {
                vm.$Loading.start()
                vm.postRequest(`/scheduler/run/${currentRowData.jobId}`).then(res=>{
                    const result = res.data;
                    if(result.code === 0){
                        vm.$Loading.finish()
                        vm.$Message.success('操作成功');
                        vm.onSearch()
                    } else {
                        vm.$Loading.error()
                        vm.$Message.error(result.msg);
                    }
                })
            }
        }
    }, [
        h('Button', {
            props: {
                type: 'ghost',
                size: 'small',
                icon: 'play',
                shape: 'circle'
            }
        })
    ]);
};

const forceButton = (vm, h, currentRowData) =>{
    return h('Poptip', {
        props: {
            //information-circled
            confirm: true,
            title: '强制执行这个任务?',
            transfer: true,
            placement: 'top-end'
        },
        style: {
            marginLeft: '10px'
        },
        on: {
            'on-ok': () => {
                vm.$Loading.start()
                vm.postRequest(`/scheduler/force/${currentRowData.recordId}`).then(res=>{
                    const result = res.data;
                    if(result.code === 0){
                        vm.$Loading.finish()
                        vm.$Message.success('操作成功');
                        vm.onSearch()
                    } else {
                        vm.$Loading.error()
                        vm.$Message.error(result.msg);
                    }
                })
            }
        }
    }, [
        h('Button', {
            props: {
                type: 'ghost',
                size: 'small',
                icon: 'play',
                shape: 'circle'
            }
        })
    ]);
};

const cancelButton = (vm, h, currentRowData) =>{
    return h('Poptip', {
        props: {
            //information-circled
            confirm: true,
            title: '确定取消执行这个任务吗?',
            transfer: true,
            placement: 'top-end'
        },
        style: {
            marginLeft: '10px'
        },
        on: {
            'on-ok': () => {
                vm.$Loading.start()
                vm.postRequest(`/scheduler/cancel/${currentRowData.recordId}`).then(res=>{
                    const result = res.data;
                    if(result.code === 0){
                        vm.$Loading.finish()
                        vm.$Message.success('操作成功')
                        vm.onSearch()
                    } else {
                        vm.$Loading.error()
                        vm.$Message.error(result.msg);
                    }
                })
            }
        }
    }, [
        h('Button', {
            props: {
                type: 'error',
                size: 'small',
                icon: 'android-close',
                shape: 'circle'
            }
        })
    ]);
};

const stopButton = (vm, h, currentRowData) =>{
    return h('Poptip', {
        props: {
            //information-circled
            confirm: true,
            title: '确定中止这个任务吗?',
            transfer: true,
            placement: 'top-end'
        },
        style: {
            marginLeft: '10px'
        },
        on: {
            'on-ok': () => {
                vm.$Loading.start()
                vm.postRequest(`/scheduler/kill/${currentRowData.recordId}`).then(res=>{
                    const result = res.data;
                    if(result.code === 0){
                        vm.$Loading.finish()
                        vm.$Message.success('操作成功')
                        vm.onSearch()
                    } else {
                        vm.$Loading.error()
                        vm.$Message.error(result.msg);
                    }
                })
            }
        }
    }, [
        h('Button', {
            props: {
                type: 'error',
                size: 'small',
                icon: 'stop',
                shape: 'circle'
            }
        })
    ]);
};

const initColumnList = [
    {
        key: 'taskType',
        title: '任务类型',
        width: 110,
        ellipsis: true
    },
    {
        key: 'jobName',
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
        width: 150
    }
];
export default {
    name: 'monitor-list',
    components: {
        TablePagination,DateRangePicker
    },
    data () {
        return {
            loadingTable: false,
            advancedQuery: false,
            enableSearch: false,
            startDate:'',
            endDate:'',
            taskType: '',
            keyWord: '',
            userId : '',
            currentStatus: '',

            total:0,
            filter:{
                page: 1,
                size: 10
            },

            columnList: [],
            taskList: [],
            userList: [],
            taskTypeList:[],
            taskTypeMap: new Map()
        };
    },
    methods: {
        init (vm) {
            vm.columnList = initColumnList
            vm.columnList.forEach(item => {
                if (item.key === 'jobName') {
                    item.render = (h, param) => {
                        const currentRowData = param.row
                        return h('a', {
                            on: {
                                click: () => {
                                    const argu = { id: currentRowData.recordId };
                                    vm.$router.push({
                                        name: 'monitor',
                                        params: argu
                                    });
                                }
                            }
                        },
                        currentRowData.jobName);
                    };
                }
                if (item.key === 'execType') {
                    item.render = (h, param) => {
                        const currentRowData = param.row
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
                        const currentRowData = param.row
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
                if (item.key === 'taskType') {
                    item.render = (h, param) => {
                        const currentRowData = param.row
                        return h('span', this.taskTypeMap.get(currentRowData.taskType))
                    };
                }
                if (item.key === 'startTime') {
                    item.render = (h, param) => {
                        const currentRowData = param.row
                        return h('span', Util.formatDateTime(currentRowData.startTime))
                    };
                }
                if (item.key === 'endTime') {
                    item.render = (h, param) => {
                        const currentRowData = param.row
                        return h('span', Util.formatDateTime(currentRowData.endTime))
                    };
                }
                if (item.key === 'durationTime') {
                    item.render = (h, param) => {
                        const currentRowData = param.row
                        const durationTime = Util.timeDiff(currentRowData.startTime, currentRowData.endTime)
                        return h('span', durationTime)
                    };
                }
                if (item.key === 'operation') {
                    item.render = (h, param) => {
                        const currentRowData = param.row
                        if(currentRowData.status === 0){
                            return h('div', [
                                reviewButton(vm, h, currentRowData),
                                stopButton(vm, h, currentRowData)
                            ]);
                        } else if(currentRowData.status === -1) {
                            return h('div', [
                                reviewButton(vm, h, currentRowData),
                                cancelButton(vm, h, currentRowData),
                                forceButton(vm, h, currentRowData)
                            ]);
                        } else {
                            return h('div', [
                                reviewButton(vm, h, currentRowData)
                            ]);
                        }
                    };
                }
            });
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
        resetFilter () {
            // 关闭自动触发查询
            this.enableSearch = false
            this.keyWord = ''
            this.currentStatus = ''
            this.taskType = ''
            this.userId = Number(Cookies.get('userId'))
            // 打开自动触发查询
            this.enableSearch = true
        },
        resetSearch () {
            if(this.enableSearch){
                this.filter.page = 1
                this.getData()
            }
        },
        onDateChange (date){
            if(date[0]===''){
                this.startDate = this.endDate = ''
            } else {
                this.startDate = Util.formatDate(date[0])
                this.endDate = Util.formatDate(date[1])
            }
            this.resetSearch()
        },

        getData () {
            this.loadingTable = true
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

            const page = this.filter.page - 1
            const size = this.filter.size

            const taskType = Util.formatNumber(this.taskType)
            const userId = Util.formatNumber(this.userId)

            this.getRequest(`/monitor/list?size=${size}&page=${page}&taskType=${taskType}&keyWord=${this.keyWord}&status=${status}&success=${success}&userId=${userId}&startDate=${this.startDate}&endDate=${this.endDate}`).then(res => {
                const result = res.data
                this.loadingTable = false
                if(result.code === 0){
                    this.$Loading.finish()
                    this.taskList = result.data.content
                    this.total = result.data.totalElements
                } else {
                    this.$Loading.error()
                    this.taskList = []
                    this.total = 0
                }
            })
        },
        changePageInfo(filter) {
            this.filter = filter;
            this.getData()
        }
    },
    activated () {
        this.enableSearch = true
        this.getData()
    },
    mounted () {
        this.getRequest('/scheduler/taskType').then(res => {
            const result = res.data
            if(result.code === 0){
                this.taskTypeList = result.data
                result.data.forEach(x => { this.taskTypeMap.set(x.id, x.name) })
                this.init(this)
            }
        })
    },
    created () {
        this.getRequest('/task/userList').then(res => {
            const result = res.data
            if(result.code === 0){
                this.userList = result.data
                this.userId = Number(Cookies.get('userId'))
            }
        })
    }
};
</script>