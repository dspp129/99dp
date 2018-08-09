<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row>
            <div style="float: left;">
                <Select
                    v-model="username"
                    ref="username"
                    @on-change="resetSearch"
                    clearable
                    placeholder="所有人..."
                    style="width:120px">
                    <Option v-for="item in userList" :value="item.username" :key="item.username">{{item.trueName}}</Option>
                </Select>
                <Input v-model="name" placeholder="请输入报表名称..."
                    @on-enter="resetSearch"
                    @on-blur="resetSearch"
                    style="width: 150px" />
                <Input v-model="subject" placeholder="请输入邮件标题..."
                    @on-enter="resetSearch"
                    @on-blur="resetSearch"
                    style="width: 150px" />
                <Input v-model="keyWord" placeholder="请输入SQL关键字..."
                    @on-enter="resetSearch"
                    @on-blur="resetSearch"
                    style="width: 200px" />
                <Button type="primary" shape="circle" icon="search" @click="resetSearch" :loading="loadingTable"></Button>
                <Button type="ghost" shape="circle" icon="loop" @click="resetFilter"></Button>
            </div>

            <Button style="float: right" type="primary" shape="circle" icon="plus-round" @click="newTask" ></Button>
        </Row>
        <Row class="margin-top-8">
            <TablePagination :total="total" :size="filter.size" @on-page-info-change="changePageInfo">
                <Table stripe
                :columns="columnList" 
                :data="tableList" 
                :loading="loadingTable"
                slot="table"
                size="small"></Table>
            </TablePagination>
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
                const argu = { name: currentRowData.name };
                vm.$router.push({
                    name: 'report-auto',
                    params: argu
                });
            }
        }
    })
};

const initColumnList = [
    {
        key: 'trueName',
        title: '开发人员',
        width: 90
    },
    {
        key: 'name',
        title: '报表名称',
        ellipsis: true
    },
    {
        key: 'subject',
        title: '邮件标题',
        ellipsis: true
    },
    {
        key: 'isScheduled',
        title: '运行方式',
        align: 'center',
        width: 90
    },
    {
        key: 'attachmentType',
        title: '附件类型',
        align: 'center',
        width: 100
    },
    {
        key: 'crontab',
        title: 'crontab表达式',
        align: 'center',
        width: 160
    },
    {
        key: 'operation',
        title: '操作',
        align: 'center',
        width: 110,
        fixed: 'right'
    }
];

import TablePagination from '@/views/my-components/tablePagination'

export default {
    name: 'report-auto-list',
    components: {
        TablePagination
    },
    data () {
        return {
            loadingTable: false,

            username: '',
            keyWord: '',
            subject:'',
            name: '',

            total:0,
            filter:{
                page: 1,
                size: 10
            },

            columnList: [],
            tableList: [],
            userList: [],
            userMap: new Map(),
        };
    },
    methods: {
        init () {
            this.columnList = initColumnList
            this.columnList.forEach(item => {


                if (item.key === 'trueName') {
                    item.render = (h, param) => {
                        const currentRowData = this.tableList[param.index]
                        return h('span', this.userMap.get(currentRowData.username))
                    };
                }

                if (item.key === 'isScheduled') {
                    item.render = (h, param) => {
                        const currentRowData = this.tableList[param.index]
                        if(currentRowData.isScheduled === 1) {
                            return h('Tag', {props:{color:'green'}}, '自 动')
                        } else {
                            return h('Tag', {props:{color:'default'}}, '手 动')
                        }
                    };
                }

                if (item.key === 'attachmentType') {
                    item.render = (h, param) => {
                        const currentRowData = this.tableList[param.index]
                        const attach = currentRowData.attachmentType
                        if(attach === '1'){
                            return h('Tag', {props:{color:'green'}}, 'Excel')
                        } else if (attach === '2'){
                            return h('Tag', {props:{color:'yellow'}}, 'Zip压缩')
                        }
                    };
                }

                if (item.key === 'crontab') {
                    item.render = (h, param) => {
                        const currentRowData = this.tableList[param.index]
                        return h('span', this.assembleCron(currentRowData))
                    };
                }

                if (item.key === 'operation') {
                    item.render = (h, param) => {
                        const currentRowData = this.tableList[param.index]
                        return h('div', [
                            reviewButton(this, h, currentRowData)
                        ]);
                    };
                }
            });

            this.getData()
        },
        resetSearch () {
            this.filter.page = 1
            this.getData()
        },
        resetFilter () {
            this.name = ''
            this.keyWord = ''
            this.subject = ''
        },
        newTask () {
            const timestamp = new Date().getTime()
            const argu = { name: 'new-' + timestamp };
            this.$router.push({
                name: 'report-auto',
                params: argu
            });
        },
        getData () {
            this.$Loading.start()
            this.loadingTable = true
            const page = this.filter.page
            const size = this.filter.size
            const username = typeof(this.username) == 'undefined' ? '' : this.username;
            this.getRequest(`/report/auto/list?username=${username}&name=${this.name}&subject=${this.subject}&keyWord=${this.keyWord}&size=${size}&page=${page}`).then(res =>{
                const result = res.data
                if(result.code === 0){
                    this.$Loading.finish()
                    this.loadingTable = false
                    this.tableList = result.data.content
                    this.total = result.data.totalElements
                } else {
                    this.$Loading.error()
                    this.tableList = []
                    this.total = 0
                }
            })
        },
        changePageInfo(filter) {
            this.filter = filter;
            this.getData()
        },
        assembleCron(item){
            return item.runMinute + ' ' + item.runHour  + ' ' + item.runDay  + ' ' + item.runMonth  + ' ' + item.runWeek
        }
    },
    mounted () {
        this.init();
    },
    created () {
        this.getRequest('/task/userList').then(res=>{
            const result = res.data
            if(result.code === 0){
                this.userList = result.data
                this.userList.forEach(x => this.userMap.set(x.username, x.trueName))
            }
        })
    }
};
</script>
