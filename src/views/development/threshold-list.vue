<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row>
            <div style="float: left;">
                <Select
                    v-model="userId"
                    ref="userId"
                    @on-change="resetSearch"
                    clearable
                    placeholder="所有人..."
                    style="width:120px">
                    <Option v-for="item in userList" :value="item.id" :key="item.id">{{item.trueName}}</Option>
                </Select>
                <Input v-model="keyWord" placeholder="请输入任务名称..."
                    @on-enter="resetSearch"
                    @on-blur="resetSearch" 
                    style="width: 200px" />
                <Button type="primary" shape="circle" icon="search" @click="resetSearch" :loading="loadingTable"></Button>
                <Button type="ghost" shape="circle" icon="loop" @click="resetFilter"></Button>
            </div>
            <Button type="primary" shape="circle" icon="plus-round" @click="newTask" style="float: right">
            </Button>
        </Row>
        <Row class="margin-top-8">
            <TablePagination :total="total" :size="filter.size" @on-page-info-change="changePageInfo">
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

const deleteButton = (vm, h, currentRowData, index) => {
    return h('Poptip', {
        props: {
            //information-circled
            confirm: true,
            title: '您确定要删除这个任务吗?',
            transfer: true,
            placement: 'top-end'
        },
        on: {
            'on-ok': () => {
                vm.$Loading.start()
                vm.deleteRequest(`/task/${currentRowData.jobId}`).then(res=>{
                    const result = res.data;
                    if(result.code === 0){
                        vm.$Loading.finish()
                        vm.taskList.splice(index, 1)
                        vm.$Message.success('删除了第' + (index + 1) + '行数据')
                    } else {
                        vm.$Loading.error()
                        vm.$Message.error('删除失败。' + result.msg);
                    }
                })
            }
        }
    }, [
        h('Button', {
            props: {
                type: 'error',
                size: 'small',
                icon: 'android-delete',
                shape: 'circle'
            }
        })
    ]);
};

const reviewButton = (vm, h, currentRowData) => {
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
                const argu = { id: currentRowData.jobId };
                vm.$router.push({
                    name: 'task-threshold',
                    params: argu
                });
            }
        }
    })
};


const initColumnList = [
    {
        key: 'jobName',
        title: '监控名称',
        ellipsis: true
    },
    {
        key: 'pause',
        title: '执行方式',
        align: 'center',
        width: 90
    },
    {
        key: 'nextFireTime',
        title: '下次执行时间',
        align: 'center',
        width: 160
    },
    {
        key: 'currentStatus',
        title: '运行状态',
        align: 'center',
        width: 100
    },
    {
        key: 'operation',
        title: '操作',
        align: 'center',
        width: 140,
        fixed: 'right'
    }
];


import Util from '@/libs/util';
import TablePagination from '@/views/my-components/tablePagination';
import KickoffTask from './components/kickoff-task';

export default {
    name: 'threshold-list',
    components: {
        TablePagination,KickoffTask
    },
    data () {
        return {

            loadingTable: true,
            showingModal: false,

            keyWord: '',
            userId : 0,

            total:0,
            filter:{
                page: 1,
                size: 10
            },

            columnList: [],
            taskList: [],
            userList: [],

            execJobId: 0
        };
    },
    methods: {
        init () {

            this.columnList = initColumnList
            this.columnList.forEach(item => {

                if (item.key === 'jobName') {
                    item.render = (h, param) => {
                        const currentRowData = param.row
                        return h('a', {
                            on: {
                                click: () => {
                                    const argu = { id: currentRowData.jobId };
                                    this.$router.push({
                                        name: 'task-threshold',
                                        params: argu
                                    });
                                }
                            }
                        },
                        currentRowData.jobName);
                    };
                }

                if (item.key === 'pause') {
                    item.render = (h, param) => {
                        const currentRowData = param.row
                        if(currentRowData.pause) {
                            return h('Tag', {props:{color:'default'}}, '手 动')
                        } else {
                            return h('Tag', {props:{color:'green'}}, '自 动')
                        }
                    };
                }

                // 0-未调度, 1-等待中, 2-执行中, 3-成功, 4-失败, 5-超时被杀, 6-手动被杀
                if (item.key === 'currentStatus') {
                    item.render = (h, param) => {
                        const currentRowData = this.taskList[param.index]

                        switch(currentRowData.success) {
                            case 1 : return h('Tag', {props:{color:'green'}},'成 功')
                            case 0 : return h('Tag', {props:{color:'red'}},'失 败')
                            case 2 : return h('Tag', {props:{color:'red'}},'被 杀')
                            case 3 : return h('Tag', {props:{color:'red'}},'超 时')
                            default : return h('Tag', {props:{color:'default'}},'未调度')
                        }
                    };
                }

                if (item.key === 'nextFireTime') {
                    item.render = (h, param) => {
                        const currentRowData = this.taskList[param.index]
                        if(currentRowData.nextFireTime > Date.now()){
                            return h('span', Util.formatDateTime(currentRowData.nextFireTime))
                        } else {
                            return h('span', '— —')
                        }
                    };
                }

                if (item.key === 'operation') {
                    item.render = (h, param) => {
                        const currentRowData = this.taskList[param.index]
                        return h('div', [
                            reviewButton(this, h, currentRowData),
                            deleteButton(this, h, currentRowData, param.index)
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
            this.keyWord = ''
            this.userId = Util.getUserId()
        },
        newTask () {
            const timestamp = new Date().getTime()
            const argu = { id: 'new-' + timestamp };
            this.$router.push({
                name: 'task-threshold',
                params: argu
            });
        },
        getData () {
            this.$Loading.start()
            this.loadingTable = true
            const page = this.filter.page
            const size = this.filter.size
            const userId = Util.formatNumber(this.userId)

            this.getRequest(`/task/list?keyWord=${this.keyWord}&size=${size}&page=${page}&taskType=4&userId=${userId}`).then(res =>{
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
        },
        refresh(){
            parent.location.reload(); 
        }
    },
    activated () {
        this.getData()
    },
    mounted () {
        this.userId = Util.getUserId()
        // this.getData()
    },
    created () {
        this.getRequest('/task/userList').then(res=>{
            const result = res.data
            if(result.code === 0){
                this.userList = result.data
            }
        })
        this.init();
    },
    computed : {
    },
    watch : {
    }
};
</script>
