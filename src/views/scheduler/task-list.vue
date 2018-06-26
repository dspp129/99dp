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

        <Modal v-model="showingWindow"
            width="360"
            :mask-closable="false"
            :closable="true">
            <p slot="header" style="color:#ff9900;text-align:center">
                <Icon type="help-circled"></Icon>
                <span>手动执行任务</span>
            </p>
            <Row type="flex" justify="center" align="middle" >
                <RadioGroup v-model="execType" vertical>
                    <Radio label="immediate">
                        <Icon type="paper-airplane"></Icon>
                        <span>立即执行</span>
                    </Radio>
                    <Radio label="planned">
                        <Icon type="ios-clock-outline"></Icon>
                        <span>计划执行</span>
                    </Radio>
                </RadioGroup>
            </Row>

            <Row type="flex" justify="center" align="middle" class="margin-top-10">
                <Col span="12">
                    <DatePicker type="date" 
                        :disabled="execType === 'immediate'"
                        placeholder="选择日期"
                        :start-date="new Date()"
                        :options="options3"
                        v-model="selectDate"
                        ></DatePicker>
                </Col>
            </Row>
            <Row type="flex" justify="center" align="middle" class="margin-top-10">
                <Col span="12">
                    <TimePicker type="time" 
                        :disabled="execType === 'immediate'"
                        placeholder="选择时间"
                        v-model="selectTime"
                        ></TimePicker>
                
                </Col>
            </Row>
            <div slot="footer">
                <Button type="ghost" shape="circle" icon="close-round" @click="closeModal"></Button>
                <Button type="success" shape="circle" icon="checkmark-round" @click="asyncOK" :disabled="runnable" :loading="submitting"></Button>
            </div>
        </Modal>

    </div>
</template>

<script>

const playButton = (vm, h, currentRowData, index) =>{
    return h('Button', {
        props: {
            type: 'ghost',
            size: 'small',
            icon: 'play',
            shape: 'circle'
        },
        style: {
            marginRight: '10px'
        },
        on: {
            click: () => {
                vm.execJobId = currentRowData.jobId
                vm.openModal()
            }
        }
    })
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
                vm.deleteRequest(`/scheduler/task/${currentRowData.id}`).then(res=>{
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
            submitting: false,
            loadingTable: true,
            showingWindow: false,
            taskType: '',
            taskTypeMap: new Map(),

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

            execJobId: '',
            execType: '',
            selectDate: new Date(),
            selectTime: '',

            options3: {
                disabledDate (date) {
                    return date && date.valueOf() < Date.now() - 86400000;
                }
            },

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

                        return h('Tag', {props:{color:'green'}},currentRowData.success)

                        switch(currentRowData.success) {
                            case 1 : return h('Tag', {props:{color:'green'}},'成 功')
                            case 0 : return h('Tag', {props:{color:'red'}},'失 败')
                            case 2 : return h('Tag', {props:{color:'red'}},'强 制')
                            case 3 : return h('Tag', {props:{color:'red'}},'超 时')
                            default : return h('Tag', {props:{color:'default'}},'未调度')
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
            const timestamp = new Date().getTime()
            const argu = { id: 'new-' + timestamp };
            this.$router.push({
                name: 'task-' + taskTypeName,
                params: argu
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
        },
        runJob(){

        },
        openModal(){
            this.execType = 'immediate'
            this.selectDate = new Date()
            this.selectTime = ''
            this.showingWindow = true
        },
        closeModal() {
            this.showingWindow = false
        },
        asyncOK(){
            this.submitting = true
            let fireTime = ''
            if(this.execType !== 'immediate'){
                const date = Util.formatDate(this.selectDate)
                if(date === '— —'){
                    this.$Message.error('时间格式有误，请重新输入。')
                    return;
                }
                fireTime = date + ' ' + this.selectTime
            }

            this.postRequest(`/scheduler/job/run?jobId=${this.execJobId}&fireTime=${fireTime}`).then(res=>{
                const result = res.data;
                if(result.code === 0){
                    this.$Loading.finish()
                    this.$Message.success('操作成功');
                    setTimeout(() => {
                        this.submitting = false
                        this.closeModal()
                    }, 1000);
                } else {
                    this.submitting = false
                    this.$Loading.error()
                    this.$Message.error(result.msg);
                }
            })

        }
    },
    activated () {
        this.getData()
    },
    mounted () {
        // this.getData()
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
    },
    computed : {
        runnable(){
            if(this.execType === 'immediate'){
                return false
            } else if (this.selectTime !== '' && this.selectDate !== ''){
                return false
            }

            return true
        }
    },
    watch : {
    }
};
</script>
