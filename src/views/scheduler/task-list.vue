<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row>
            <div style="float: left;">
                <Select
                    v-model="ownerId"
                    ref="ownerId"
                    @on-change="resetSearch"
                    clearable
                    placeholder="所有人..."
                    style="width:120px">
                    <Option v-for="item in userList" :value="item.id" :key="item.id">{{item.trueName}}</Option>
                </Select>
                <Select
                    v-model="taskType"
                    ref="taskType"
                    @on-change="resetSearch"
                    clearable
                    placeholder="所有类型..."
                    style="width:120px">
                    <Option v-for="item in taskTypeList" :value="item.id" :key="item.id">{{item.taskType}}</Option>
                </Select>
                <Input v-model="keyWord" placeholder="请输入任务名称..."
                    @on-enter="resetSearch"
                    style="width: 200px" />
                <Button type="primary" shape="circle" icon="search" @click="resetSearch" :loading="loadingTable"></Button>
                <Button type="ghost" shape="circle" icon="loop" @click="resetFilter"></Button>
            </div>
            <Dropdown style="float: right" placement="bottom-end"  @on-click="newTask" trigger="click">
                <Button type="primary" shape="circle" icon="plus-round" ></Button>
                <DropdownMenu slot="list">
                    <DropdownItem v-for="item in taskTypeList" :name="item.id" :key="item.id">{{item.taskType}}</DropdownItem>
                </DropdownMenu>
            </Dropdown>
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

const playButton = (vm, h, currentRowData, index) =>{
    return h('Poptip', {
        props: {
            //information-circled
            confirm: true,
            title: '手动执行这个任务?',
            transfer: true,
            placement: 'top-end'
        },
        style: {
            marginRight: '10px'
        },
        on: {
            'on-ok': () => {
                vm.$Loading.start()
                vm.postRequest(`/scheduler/run/${currentRowData.jobId}`).then(res=>{
                    const result = res.data;
                    if(result.code === 0){
                        vm.$Loading.finish()
                        vm.$Message.success('操作成功');
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
                vm.deleteRequest(`/scheduler/${currentRowData.id}`).then(res=>{
                    const result = res.data;
                    if(result.code === 0){
                        vm.$Loading.finish()
                        vm.taskList.splice(index, 1)
                        vm.alertSuccess('删除了第' + (index + 1) + '行数据')
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
                const taskTypeName = vm.taskTypeMap.get(currentRowData.taskType)
                const argu = { id: currentRowData.id };
                vm.$router.push({
                    name: 'task-' + taskTypeName,
                    params: argu
                });
            }
        }
    })
};

const taskTypeList = [
    {
        id:1,taskType:'ETL'
    },
    {
        id:2,taskType:'SQL'
    },
    {
        id:3,taskType:'Shell'
    }
];


const initColumnList = [
    {
        key: 'taskType',
        title: '任务类型',
        width: 110,
        ellipsis: true
    },
    {
        key: 'name',
        title: '任务名称',
        ellipsis: true
    },
    {
        key: 'isScheduled',
        title: '调度方式',
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


import Cookies from 'js-cookie';
import Util from '@/libs/util';
import TablePagination from '@/views/my-components/tablePagination';

export default {
    name: 'task-list',
    components: {
        TablePagination
    },
    data () {
        return {
            loadingTable: true,
            taskType: '',
            keyWord: '',
            ownerId : 0,

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
        init () {
            this.taskTypeList = taskTypeList
            this.taskTypeList.forEach(x => this.taskTypeMap.set(x.id, x.taskType))
            this.columnList = initColumnList
            this.columnList.forEach(item => {

                if (item.key === 'isScheduled') {
                    item.render = (h, param) => {
                        const currentRowData = this.taskList[param.index]
                        if(currentRowData.isScheduled === 1) {
                            return h('Tag', {props:{color:'green'}}, '自 动')
                        } else {
                            return h('Tag', {props:{color:'default'}}, '手 动')
                        }
                    };
                }

                // 0-未调度, 1-等待中, 2-执行中, 3-成功, 4-失败, 5-超时被杀, 6-手动被杀
                if (item.key === 'currentStatus') {
                    item.render = (h, param) => {
                        const currentRowData = this.taskList[param.index]
                        switch(currentRowData.currentStatus) {
                            case 1 : return h('Tag', {props:{color:'blue'}},'等 待')
                            case 2 : return h('Tag', {props:{color:'yellow'}},'执 行')
                            case 3 : return h('Tag', {props:{color:'green'}},'成 功')
                            case 4 : return h('Tag', {props:{color:'red'}},'失 败')
                            case 5 : return h('Tag', {props:{color:'#80848f'}},'被 杀')
                            case 6 : return h('Tag', {props:{color:'#80848f'}},'被 杀')
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
                            playButton(this, h, currentRowData, param.index),
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
            this.taskType = ''
            const userId = Cookies.get('userId')
            this.ownerId = Number(userId)
        },
        newTask (taskType) {
            const taskTypeName = this.taskTypeMap.get(taskType)
            const argu = { id: 'new' };
            this.$router.push({
                name: 'task-' + taskTypeName,
                params: argu
            });
        },
        alertSuccess (msg) {
            this.$Notice.success({
                title: msg,
                duration: 3
            });
        },
        getData () {
            this.$Loading.start()
            this.loadingTable = true
            const page = this.filter.page - 1
            const size = this.filter.size
            const taskType = Util.formatNumber(this.taskType)
            const ownerId = Util.formatNumber(this.ownerId)

            this.getRequest(`/scheduler/list?keyWord=${this.keyWord}&size=${size}&page=${page}&taskType=${taskType}&ownerId=${ownerId}`).then(res =>{
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
        //console.log('task-list: activated.');
        //this.getData()
    },
    mounted () {
        this.getData()
    },
    created () {
        this.getRequest('/task/userList').then(res=>{
            const result = res.data
            if(result.code === 0){
                this.userList = result.data
                const userId = Cookies.get('userId')
                this.ownerId = Number(userId)
            }
        })
        this.init();
    }
};
</script>
