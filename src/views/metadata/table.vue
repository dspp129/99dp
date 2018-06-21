<style lang="less">
    @import '../../styles/common.less';
    @import './components/table.less';
</style>

<template>
    <div>
        <Row>
            <div style="float: left;">
                <Select
                    v-model="dbType"
                    ref="dbType"
                    @on-change="resetSearch"
                    clearable
                    placeholder="数据库类型..."
                    style="width:120px">
                    <Option v-for="item in dbTypeList" :value="item.id" :key="item.id">{{item.name}}</Option>
                </Select>
                <Input v-model="keyWord" @on-enter="resetSearch" placeholder="请输入关键字..." style="width: 250px"></Input>
                <Button type="primary" shape="circle" icon="search" @click="resetSearch" :loading="loadingTable"></Button>
                <Button type="ghost" shape="circle" icon="loop" @click="resetFilter"></Button>
            </div>
            <div style="float: right">
                <Button class="margin-left-10" type="primary" icon="plus-round" @click="openModal">导入表</Button>
            </div>
            <ImportTable :dbTypeList="dbTypeList" :show="modal" @onCloseModal="onCloseModal" class-name="vertical-center-modal"></ImportTable>
        </Row>
        <Row class="margin-top-10">
            <TablePagination :total="total" :size="filter.size" @on-page-info-change="changePageInfo">
                <Table stripe border
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

const deleteButton = (vm, h, currentRowData, index) => {
    return h('Poptip', {
        props: {
            //information-circled
            confirm: true,
            title: '您确定要删除这张表吗?',
            transfer: true,
            placement: 'top-end'
        },
        on: {
            'on-ok': () => {
                vm.deleteRequest('/metadata/table/' + currentRowData.id).then(res=>{
                    vm.tableList.splice(index, 1)
                    vm.alertSuccess('删除了第' + (index + 1) + '行数据')
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
                const argu = { id: currentRowData.id };
                vm.$router.push({
                    name: 'table-detail',
                    params: argu
                });
            }
        }
    })
};


const heartBeatIcon = (vm, h, currentRowData, index) => {
    return h('Icon', {
        props: {
            size: 20,
            color: currentRowData.isCore === 0 ? '#19be6b' : '#ff9900',
            type: currentRowData.isCore === 0 ? '' : 'star'
        }
    })
};

const initColumnList = [
    {
        key: 'dbType',
        title: '数据库类型',
        width: 110,
        ellipsis: true
    },
    {
        key: 'dbName',
        title: '库名',
        width: 130,
        ellipsis: true
    },
    {
        key: 'tableName',
        title: '表名',
        ellipsis: true
    },
    {
        key: 'isCore',
        title: '核心',
        align: 'center',
        width: 65
    },
    {
        key: 'tableTypeName',
        title: '表类型',
        ellipsis: true,
        align: 'center',
        width: 80
    },
    {
        key: 'tableComment',
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
import ImportTable from './components/importTable'
import Util from '@/libs/util';

export default {
    name: 'table-list',
    components: {
        TablePagination,ImportTable
    },
    data () {
        return {
            loadingTable: false,
            modal: false,

            keyWord: '',
            dbType : 0,

            total:0,
            filter:{
                page: 1,
                size: 10
            },

            columnList: [],
            tableList: [],

            dbTypeList: [],
            dbTypeMap: new Map()

        };
    },
    methods: {
        init () {
            this.columnList = initColumnList;
            this.columnList.forEach(item => {
                if (item.key === 'isCore') {
                    item.render = (h, param) => {
                        const currentRowData = this.tableList[param.index];
                        return h('a',[
                            heartBeatIcon(this, h, currentRowData, param.index)
                        ]);
                    };
                }
                if (item.key === 'dbType') {
                    item.render = (h, param) => {
                        const currentRowData = this.tableList[param.index];
                        return h('span', this.dbTypeMap.get(currentRowData.dbType));
                    };
                }
                if (item.key === 'operation') {
                    item.render = (h, param) => {
                        const currentRowData = this.tableList[param.index];
                        return h('div', [
                            reviewButton(this, h, currentRowData),
                            deleteButton(this, h, currentRowData, param.index)
                        ]);
                    };
                }
            });
        },
        resetFilter () {
            this.$refs.dbType.clearSingleSelect()
            this.keyWord = ''
        },
        alertSuccess (msg) {
            this.$Notice.success({
                title: msg,
                duration: 3
            });
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
            const dbType = Util.formatNumber(this.dbType)

            this.$Loading.start()
            this.getRequest(`/metadata/table/list?keyWord=${this.keyWord}&size=${size}&page=${page}&dbType=${dbType}`).then(res => {
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
        // this.getData()
    },
    deactivated (){
    },
    mounted () {
        this.getData()
    },
    created () {
        this.getRequest('/metadata/dbType').then(res => {
            const result = res.data
            if(result.code === 0){
                this.dbTypeList = result.data
                this.dbTypeList.forEach(x => this.dbTypeMap.set(x.id, x.name))
                this.init()
            }
        })
    }
};
</script>
