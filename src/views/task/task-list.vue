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
                    <Option v-for="item in ownerList" :value="item.id" :key="item.id" :label="item.label"></Option>
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


import Pagination from '../my-components/pagination'


export default {
    name: 'task-list',
    components: {
        Pagination
    },
    data () {
        return {
            loadingPage: true,

            keyWord: '',
            ownerId : '',
            total: 0,
            current: 1,
            size: 10,


            columnList: [],
            taskList: [],
            initTaskList: [],
            ownerList: [],
            taskTypeList:[]

        };
    },
    methods: {
        init () {
            this.taskList = this.initTaskList = table.searchTable2;
            this.taskTypeList = table.taskTypeList
            this.ownerList = table.ownerList;
            this.columnList = table.columnList;

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
            this.ownerId = 1
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

        }
    },
    mounted () {
        this.init();
    }
};
</script>
