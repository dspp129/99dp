<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <Card icon="social-buffer" title="组详情">
        <Row>
            <div style="float: left;">
                <Select
                    v-model="status"
                    ref="status"
                    @on-change="resetSearch"
                    clearable
                    placeholder="状态"
                    style="width:80px">
                    <Option v-for="item in statusList" :value="item.id" :key="item.id">{{item.name}}</Option>
                </Select>
                <Input v-model="keyWord" @on-enter="resetSearch" @on-blur="resetSearch" placeholder="请输入执行器名称..." style="width: 180px"></Input>
                <Input v-model="host" @on-enter="resetSearch" @on-blur="resetSearch" placeholder="请输入host..." style="width: 180px"></Input>
                <Button type="primary" shape="circle" icon="search" @click="resetSearch" :loading="loadingTable"></Button>
                <Button type="ghost" shape="circle" icon="loop" @click="resetFilter"></Button>
            </div>
        </Row>
        <Row class="margin-top-10">
            <TablePagination :total="total" :size="filter.size" @on-page-info-change="changePageInfo">
                <Table stripe
                :columns="columnList" 
                :data="tableList" 
                :loading="loadingTable"
                slot="table"
                size="small"></Table>
            </TablePagination>
        </Row>
    </Card>
</template>

<script>

const statusList = [
    {
        id: 1,
        name: '正常'
    },
    {
        id: 0,
        name: '失联'
    },
    {
        id: 2,
        name: '错误'
    },
];

const editButton = (vm, h, currentRowData) => {
    return h('Button', {
        props: {
            type: 'info',
            size: 'small',
            icon: 'edit',
            shape: 'circle'
        },
        style: {
          //  marginRight: '10px'
        },
        on: {
            click: () => {
                vm.agent = JSON.parse(JSON.stringify(currentRowData))
                vm.openModal()
            }
        }
    })
};

const statusTag = (vm, h, currentRowData, index) => {
    return h('Tag', {
        props: {
            color: currentRowData.status === 1 ? 'green' : 'red'
        }
    }, currentRowData.status === 1 ? '正 常':'失 联')
};

const warningTag = (vm, h, currentRowData, index) => {
    return h('Tag', {
        props: {
            color: currentRowData.warning ? 'green' : 'yellow'
        }
    }, currentRowData.warning ? '启 动':'忽 略')
};

const initColumnList = [
    {
        key: 'name',
        title: '执行器名称',
        ellipsis: true
    },
    {
        key: 'host',
        title: 'Host',
        ellipsis: true
    },
    {
        key: 'userName',
        title: '负责人',
        align: 'center',
        ellipsis: true
    },
    {
        key: 'status',
        title: '通信状态',
        align: 'center',
        width: 100
    },
    {
        key: 'warning',
        title: '失联报警',
        align: 'center',
        width: 100
    },
    {
        key: 'comment',
        title: '注释'
    },
    {
        key: 'operation',
        title: '操作',
        align: 'center',
        width: 100,
        fixed: 'right'
    }
];

import TablePagination from '@/views/my-components/tablePagination'
import Util from '@/libs/util';

export default {
    name: 'agent-group-detail',
    components: {
        TablePagination
    },
    data () {

        return {
            loadingTable: false,
            showingWindow: false,

            keyWord: '',
            host: '',
            status : '',

            total:0,
            filter:{
                page: 1,
                size: 10
            },

            agent: {},

            columnList: [],
            tableList: [],
            userList: [],
            statusList: []

        };
    },
    methods: {
        init () {
            this.statusList = statusList
            this.columnList = initColumnList;
            this.columnList.forEach(item => {
                if (item.key === 'status') {
                    item.render = (h, param) => {
                        const currentRowData = this.tableList[param.index];
                        return h('a',[
                            statusTag(this, h, currentRowData, param.index)
                        ]);
                    };
                }

                if (item.key === 'warning') {
                    item.render = (h, param) => {
                        const currentRowData = this.tableList[param.index];
                        return h('a',[
                            warningTag(this, h, currentRowData, param.index)
                        ]);
                    };
                }

                if (item.key === 'operation') {
                    item.render = (h, param) => {
                        const currentRowData = this.tableList[param.index];
                        return h('div', [
                            editButton(this, h, currentRowData)
                        ]);
                    };
                }
            });
        },
        resetFilter () {
            this.$refs.status.clearSingleSelect()
            this.keyWord = ''
        },
        changePageInfo(filter) {
            this.filter = filter;
            this.getData()
        },
        resetSearch () {
            this.filter.page = 1
            this.getData()
        },
        getData(){
            this.loadingTable = true
            const page = this.filter.page
            const size = this.filter.size
            const status = Util.formatNumber(this.status)

            this.getRequest(`/cluster/agent/list?keyWord=${this.keyWord}&host=${this.host}&size=${size}&page=${page}&status=${status}`).then(res => {
                this.loadingTable = false
                const result = res.data;
                if(result.code === 0){
                    this.tableList = result.data.content
                    this.total = result.data.totalElements
                }
            })
        },
        openModal(){
            this.showingWindow = true
        },
        closeModal() {
            this.showingWindow = false
        },
        asyncOK() {
            this.$refs.agent.validate((valid) => {
                if (valid) {
                    this.savingAgent = true
                    this.patchRequest('/cluster/agent/save', this.agent).then(res => {
                        const result = res.data;
                        if(result.code === 0){
                            this.$Message.success('操作成功')
                            this.closeModal()
                            this.getData()
                        } else {
                            this.$Message.error(result.msg)
                        }
                    })
                } else {
                    this.$Message.error('Fail!');
                }
            })
        },
        onChange() {
            this.icon = ''
        }
    },
    activated () {
    },
    deactivated (){
    },
    mounted () {
        this.getData()
    },
    created () {
        this.init()
    },
    watch : {

    }
};
</script>
