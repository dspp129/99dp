<style lang="less">
    @import '../../styles/common.less';
    @import './components/table.less';
</style>

<template>
    <div>
        <Spin fix v-if="loadingPage" size="large"></Spin>
        <Row>
            <div style="float: left;">
                <Select
                    v-model="dbType"
                    ref="dbType"
                    @on-change="resetCurrent"
                    clearable
                    placeholder="数据库类型..."
                    style="width:120px">
                    <Option v-for="item in dbTypeList" :value="item.id" :key="item.id">{{item.name}}</Option>
                </Select>
                <Input v-model="keyWord" @on-enter="resetCurrent" @on-click="resetCurrent" icon="search" placeholder="请输入关键字..." style="width: 250px"></Input>
                <Button type="ghost" shape="circle" icon="refresh" @click="refreshSearch" :loading="reseting"></Button>
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
            <div style="float: right">
                <Button class="margin-left-10" type="primary" icon="plus-round" @click="openModal">导入表</Button>
                <Button class="margin-left-10" type="primary" icon="search">高级检索</Button>
            </div>
            <ImportTable :dbTypeList="dbTypeList" :show="modal" @onCloseModal="onCloseModal" class-name="vertical-center-modal"></ImportTable>

        </Row>
        <Row class="margin-top-10">
            <Table stripe border :columns="columnList" :data="tableList" size="small" :loading="reseting"></Table>
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

import Pagination from '../my-components/pagination'
import ImportTable from './components/importTable'

export default {
    name: 'table-manager',
    components: {
        Pagination,ImportTable
    },
    data () {
        return {
            loadingPage: true,
            reseting: false,
            modal: false,

            keyWord: '',
            dbType : 0,
            total: 0,
            current: 1,
            size: 10,

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
        refreshSearch () {

            //this.$refs['dbType'].clearSingleSelect()
            //this.current = 1
            //this.keyWord = ''
            //this.dbType = ''
            this.onSearch()
        },
        alertSuccess (msg) {
            this.$Notice.success({
                title: msg,
                duration: 3
            });
        },
        onSizeChange(size){
            this.size = size
            this.current = 1
            this.onSearch()
        },
        onCurrentChange(current){
            this.current = current
            this.onSearch()
        },
        resetCurrent(){
            this.current = 1
            this.onSearch()
        },
        onSearch(){
            this.reseting = true
            const page = this.current - 1

            if (typeof(this.dbType) === "undefined"){
                this.dbType = 0
            }

            this.$Loading.start()
            this.getRequest(`/metadata/table/list?keyWord=${this.keyWord}&size=${this.size}&page=${page}&dbType=${this.dbType}`).then(res => {
                this.reseting = false
                const result = res.data;
                if(result.code === 0){
                    this.$Loading.finish()
                    const data = result.data
                    this.tableList = data.content
                    this.total = data.totalElements
                }
            })
            this.cacheSearchConditions()
        },
        cacheSearchConditions(){
            this.$store.commit('setMetadataSearchTable',{
                keyWord: this.keyWord,
                size: this.size,
                current: this.current,
                dbType: this.dbType,
                total: this.total
            })
        },
        openModal(){
            this.modal = true
        },
        onCloseModal() {
            this.modal = false
        }
    },
    created () {
        const searchConditions = this.$store.state.app.metadataSearchTable
        this.keyWord = searchConditions.keyWord
        this.size = searchConditions.size
        this.current = searchConditions.current
        this.dbType = searchConditions.dbType
        this.total = searchConditions.total
    },
    mounted () {
        this.getRequest('/metadata/dbType').then(res => {
            const result = res.data
            if(result.code === 0){
                this.dbTypeList = result.data
                this.dbTypeList.forEach(x => this.dbTypeMap.set(x.id, x.name))
                this.init()
            }
        })
        const page = this.current - 1

        this.getRequest(`/metadata/table/list?keyWord=${this.keyWord}&size=${this.size}&page=${page}&dbType=${this.dbType}`).then(res => {
            const result = res.data;
            if(result.code === 0){
                this.loadingPage = false
                const data = result.data
                this.tableList = data.content
                this.total = data.totalElements
            }
        })
    }

};
</script>
