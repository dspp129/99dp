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
                    @on-current-change="onCurrentChange"
                    >
                </Pagination>
            </div>
            <Dropdown style="float: right" placement="bottom-end"  @on-click="openAddWindow" trigger="click">
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
                vm.taskList.splice(index, 1)
                vm.initTaskList = vm.initTaskList.filter(x => x != currentRowData)
                vm.alertSuccess('删除了第' + (index + 1) + '行数据')
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
        title: '状态'
    },
    {
        key: 'nestFireTime',
        title: '下次执行时间',
        width: 110
    },
    {
        key: 'currentStatus',
        title: '当前状态'
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

export default {
    name: 'task-list',
    components: {
        Pagination
    },
    data () {
        return {
            loadingPage: false,

            keyWord: '',
            ownerId : '',
            total: 0,
            current: 1,
            size: 10,


            columnList: [],
            taskList: [],
            initTaskList: [],
            userList: [],
            taskTypeList:[]

        };
    },
    methods: {
        init () {
            // this.taskList = this.initTaskList = table.searchTable2;

            this.columnList.forEach(item => {

                if (item.operate) {
                    item.render = (h, param) => {
                        let currentRowData = this.taskList[param.index];
                        return h('div', [
                            reviewButton(this, h, currentRowData),
                            playButton(this, h, currentRowData, param.index),
                            deleteButton(this, h, currentRowData, param.index)
                        ]);
                    };
                }
            });
        },
        resetCurrent(){
            this.current = 1
            this.onSearch()
        },
        resetSearch () {
            this.keyWord = ''
            this.pagination.current = 1
            this.taskList = this.initTaskList;
        },
        openAddWindow(name){
            console.log('Add ' + name  + ' task');
        },
        alertSuccess(msg) {
            this.$Notice.success({
                title: msg,
                duration: 3
            });
        },
        onSearch(){

        },
        onSizeChange(){},
        onCurrentChange(){}
    },
    mounted () {
        this.$http.get('/api/task/userList').then(res=>{
            const result = res.data
            if(result.code === 0){
                this.userList = result.data
                const userId = Cookies.get('userId')
                this.ownerId = Number(userId)
            }
        })

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
        this.columnList = initColumnList

        this.init();

    }
};
</script>
