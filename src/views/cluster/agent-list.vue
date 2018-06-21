<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
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
                <Input v-model="keyWord" @on-enter="resetSearch" placeholder="请输入关键字..." style="width: 250px"></Input>
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
    </div>
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
                const argu = { id: currentRowData.id };

            }
        }
    })
};


const heartBeatIcon = (vm, h, currentRowData, index) => {
    return h('Icon', {
        props: {
            size: 20,
            color: currentRowData.status === 0 ? '#19be6b' : '#ff9900',
            type: currentRowData.status === 0 ? '' : 'star'
        }
    })
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
        key: 'status',
        title: '状态',
        align: 'center',
        width: 65
    },
    {
        key: 'warning',
        title: '失联报警',
        align: 'center',
        width: 65
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
    name: 'agent-list',
    components: {
        TablePagination
    },
    data () {
        return {
            loadingTable: false,
            modal: false,

            keyWord: '',
            status : '',

            total:0,
            filter:{
                page: 1,
                size: 10
            },

            columnList: [],
            tableList: [],

            statusList: [],
            statusMap: new Map()

        };
    },
    methods: {
        init () {
            this.columnList = initColumnList;
            this.columnList.forEach(item => {
                if (item.key === 'status') {
                    item.render = (h, param) => {
                        const currentRowData = this.tableList[param.index];
                        return h('a',[
                            heartBeatIcon(this, h, currentRowData, param.index)
                        ]);
                    };
                }
                if (item.key === 'operation') {
                    item.render = (h, param) => {
                        const currentRowData = this.tableList[param.index];
                        return h('div', [
                            reviewButton(this, h, currentRowData)
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
            this.$Loading.start()
            this.loadingTable = true
            const page = this.filter.page - 1
            const size = this.filter.size
            const status = Util.formatNumber(this.status)

            this.$Loading.start()
            this.getRequest(`/cluster/agent/list?keyWord=${this.keyWord}&size=${size}&page=${page}&status=${status}`).then(res => {
                this.loadingTable = false
                const result = res.data;
                if(result.code === 0){
                    this.$Loading.finish()
                    this.tableList = result.data.content
                    this.total = result.data.totalElements
                }
            })
        },
        openModal(){
            this.modal = true
        },
        onCloseModal() {
            this.modal = false
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
        this.statusList = statusList
        this.statusList.forEach(x => this.statusMap.set(x.id,x.name));
    }
};
</script>
