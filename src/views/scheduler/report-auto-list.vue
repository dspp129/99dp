<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Spin fix v-if="loadingPage" size="large"></Spin>
        <Row>
            <div style="float: left;">
                <Input v-model="name" placeholder="请输入报表名称..."
                    icon="search"
                    @on-click="resetCurrent"
                    @on-enter="resetCurrent"
                    style="width: 150px" />
                <Input v-model="subject" placeholder="请输入邮件标题..."
                    icon="search"
                    @on-click="resetCurrent"
                    @on-enter="resetCurrent"
                    style="width: 150px" />
                <Input v-model="keyWord" placeholder="请输入SQL关键字..."
                    icon="search"
                    @on-click="resetCurrent"
                    @on-enter="resetCurrent"
                    style="width: 150px" />
                <Button type="ghost" shape="circle" icon="refresh" @click="resetCurrent"></Button>
                <Button type="primary" shape="circle" icon="search" @click="onSearch"></Button>
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
                <Button style="float: right" type="primary" shape="circle" icon="plus-round" @click="newTask" ></Button>
        </Row>
        <Row class="margin-top-8">
            <Table stripe :columns="columnList" :data="reportList" size="small"></Table>
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
        style: {
            marginRight: '10px'
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
        title: '调度方式',
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
        key: 'nextFireTime',
        title: '下次执行时间',
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


import Pagination from '../my-components/pagination'
import Cookies from 'js-cookie'
import moment from 'moment'

export default {
    name: 'report-auto-list',
    components: {
        Pagination
    },
    data () {
        return {
            loadingPage: false,

            attachmentType: '',
            keyWord: '',
            subject:'',
            name: '',

            total: 0,
            current: 1,
            size: 10,

            columnList: [],
            reportList: []
        };
    },
    methods: {
        init () {
            this.columnList = initColumnList
            this.columnList.forEach(item => {

                if (item.key === 'isScheduled') {
                    item.render = (h, param) => {
                        const currentRowData = this.reportList[param.index]
                        if(currentRowData.isScheduled === 1) {
                            return h('Tag', {props:{color:'green'}}, '自 动')
                        } else {
                            return h('Tag', {props:{color:'default'}}, '手 动')
                        }
                    };
                }

                if (item.key === 'attachmentType') {
                    item.render = (h, param) => {
                        const currentRowData = this.reportList[param.index]
                        const attach = currentRowData.attachmentType
                        if(attach === '1'){
                            return h('Tag', {props:{color:'green'}}, 'Excel')
                        } else if (attach === '2'){
                            return h('Tag', {props:{color:'yellow'}}, 'Zip压缩')
                        }
                    };
                }

                if (item.key === 'nextFireTime') {
                    item.render = (h, param) => {
                        const currentRowData = this.reportList[param.index]
                        if(currentRowData.nextFireTime > Date.now()){
                            return h('span', moment(currentRowData.nextFireTime).format('YYYY-MM-DD HH:mm:ss'))
                        } else {
                            return h('span', '— —')
                        }
                    };
                }

                if (item.key === 'operation') {
                    item.render = (h, param) => {
                        const currentRowData = this.reportList[param.index]
                        return h('div', [
                            reviewButton(this, h, currentRowData),
                            playButton(this, h, currentRowData, param.index)
                        ]);
                    };
                }
            });

            this.onSearch()
        },
        resetCurrent () {
            this.current = 1
            this.onSearch()
        },
        resetSearch () {
            this.keyWord = ''
            this.subject = ''
            this.pagination.current = 1
        },
        newTask () {
            const argu = { name: 'new' };
            this.$router.push({
                name: 'report-auto',
                params: argu
            });
        },
        onSearch () {
            const page = this.current - 1
            this.$Loading.start()
            this.getRequest(`/report/auto/list?name=${this.name}&subject=${this.subject}&keyWord=${this.keyWord}&size=${this.size}&page=${page}`).then(res =>{
                const result = res.data
                if(result.code === 0){
                    this.$Loading.finish()
                    this.loadingPage = false
                    this.reportList = result.data.content
                    this.total = result.data.totalElements
                } else {
                    this.$Loading.error()
                    this.reportList = []
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
        this.init();
    },
    created () {
    }
};
</script>
