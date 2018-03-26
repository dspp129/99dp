<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Spin fix v-if="loadingPage" size="large"></Spin>
        <Row>
            <div style="float: left;">
                <Select
                    v-model="ownerId"
                    ref="ownerId"
                    @on-change="resetCurrent"
                    clearable
                    placeholder="所有人..."
                    style="width:120px">
                    <Option v-for="item in userList" :value="item.id" :key="item.id" :label="item.trueName"></Option>
                </Select>
                <Select
                    v-model="taskType"
                    ref="taskType"
                    @on-change="resetCurrent"
                    clearable
                    placeholder="所有类型..."
                    style="width:120px">
                    <Option v-for="item in taskTypeList" :value="item.id" :key="item.id" :label="item.taskType"></Option>
                </Select>
                <Input v-model="keyWord" placeholder="请输入任务名称..."
                    icon="search"
                    @on-click="resetCurrent"
                    @on-enter="resetCurrent"
                    style="width: 250px" />
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
            <Dropdown style="float: right" placement="bottom-end"  @on-click="newTask" trigger="click">
                <Button type="primary" shape="circle" icon="plus-round" ></Button>
                <DropdownMenu slot="list">
                    <DropdownItem v-for="item in taskTypeList" :name="item.id" :key="item.id">{{item.taskType}}</DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </Row>
        <Row class="margin-top-8">
            <Table stripe :columns="columnList" :data="taskList" size="small"></Table>
        </Row>
    </div>
</template>

<script>

const deleteButton = (vm, h, currentRowData, index) => {
    return h('Poptip', {
        props: {
            //information-circled
            confirm: true,
            title: '您确定要删除这条数据吗?',
            transfer: true,
            placement: 'top-end'
        },
        on: {
            'on-ok': () => {
                vm.$Loading.start()
                vm.$http.delete(`/api/scheduler/${currentRowData.id}`).then(res=>{
                    const result = res.data;
                    if(result.code === 0){
                        vm.$Loading.finish()
                        vm.taskList.splice(index, 1)
                        vm.alertSuccess('删除了第' + (index + 1) + '行数据')
                    } else {
                        vm.$Loading.error()
                        vm.$Message.error('删除失败');
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
        width: 150
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


import Pagination from '../my-components/pagination'
import Cookies from 'js-cookie'
import moment from 'moment'

export default {
    name: 'task-list',
    components: {
        Pagination
    },
    data () {
        return {
            loadingPage: false,

            taskType: '',
            keyWord: '',
            ownerId : '',
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
                            return h('span', moment(currentRowData.nextFireTime).format('YYYY-MM-DD HH:mm:ss'))
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
        resetCurrent () {
            this.current = 1
            this.onSearch()
        },
        resetSearch () {
            this.keyWord = ''
            this.pagination.current = 1
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
        onSearch () {
            const page = this.current - 1
            this.$Loading.start()
            this.$http.get(`/api/scheduler/list?keyWord=${this.keyWord}&size=${this.size}&page=${page}&taskType=${this.taskType}&ownerId=${this.ownerId}`).then(res =>{
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
        this.taskTypeList = [
            {
                id:1,taskType:'ETL'
            },
            {
                id:2,taskType:'SQL'
            },
            {
                id:3,taskType:'Shell'
            }
        ]

        this.taskTypeList.forEach(x => this.taskTypeMap.set(x.id, x.taskType))
        this.init();

        this.$http.get('/api/task/userList').then(res=>{
            const result = res.data
            if(result.code === 0){
                this.userList = result.data
                const userId = Cookies.get('userId')
                this.ownerId = Number(userId)
            }
        })
    },
    created () {
    }
};
</script>
