<style lang="less">
    @import '../../styles/common.less';
</style>
<template>
    <div>
        <Card>
            <Row>
                <Input icon="search" placeholder="请输入检索条件..." style="width: 300px"></Input>
                <Button icon="search" type="primary" class="margin-left-10">检索</Button>
                <Button icon="search" type="primary" class="margin-left-10">高级检索</Button>
            </Row>

            <Row class="margin-top-10">
                <TablePagination :total="total" :size="filter.size" @on-page-info-change="changePageInfo">
                    <Table 
                        :columns="columnList" 
                        :data="dataList" 
                        size="small" 
                        ref="table" 
                        stripe 
                        border 
                        disabled-hover
                        slot="table"></Table>
                </TablePagination>
            </Row>
        </Card>
    </div>
</template>

<script>
import TablePagination from '@/views/my-components/tablePagination';
import * as ufuserList from './data/ufuser-list'
export default {
    name: 'ufuser-list',
    components: {
        TablePagination
    },
    data () {
        return {
            columnList:[],
            dataList:[
                {
                    name:'王海青',
                    sex:'女',
                    birthday:'1965-01-26',
                    category:'小名单',
                    dangpai:'民盟',
                    dangpaizhiwu:'区委主任',
                    nationality:'中国',
                    nation:'汉族',
                    nativeplace:'上海青浦',
                    religion:'无'
                },
                {
                    name:'王训国*',
                    sex:'男',
                    birthday:'1966-11-01',
                    category:'小名单',
                    dangpai:'九三学社',
                    dangpaizhiwu:'市委常委',
                    nationality:'中国',
                    nation:'汉族',
                    nativeplace:'江西玉山',
                    religion:'无'
                },
                {
                    name:'姚秦',
                    sex:'女',
                    birthday:'1970-08-17',
                    category:'小名单',
                    position:'中国医院学会医院建筑系统研究分会委员',
                    dangpai:'民革',
                    dangpaizhiwu:'民革上海市第十三届',
                    nationality:'中国',
                    nation:'汉族',
                    nativeplace:'上海青浦',
                    religion:'无'
                },
                {
                    name:'叶明',
                    sex:'男',
                    birthday:'1970-08-01',
                    category:'小名单',
                    nationality:'中国',
                    nation:'汉族',
                    nativeplace:'江苏镇江',
                },
                {
                    name:'白寿军',
                    sex:'男',
                    birthday:'1972-12-01',
                    category:'中名单',
                    nationality:'中国',
                    nation:'汉族'
                },
                {
                    name:'鲍崇华',
                    sex:'男',
                    birthday:'1964-06-01',
                    category:'中名单',
                    nationality:'中国',
                    nation:'汉族'
                },
                {
                    name:'本愿',
                    sex:'女',
                    birthday:'1957-06-04',
                    category:'中名单',
                    nationality:'中国',
                    nation:'汉族',
                    nativeplace:'上海',
                    religion:'佛教'
                },
                {
                    name:'卞德志',
                    sex:'男',
                    birthday:'1982-02-09',
                    category:'中名单',
                    nationality:'中国',
                    nation:'汉族',
                    nativeplace:'姜堰',
                    religion:'佛教'
                },
                {
                    name:'蔡海荣',
                    sex:'男',
                    birthday:'1955-06-24',
                    category:'中名单',
                    position:'青浦工商联副主席',
                    nationality:'中国',
                    nation:'汉族'
                },
                {
                    name:'蔡建林',
                    sex:'男',
                    birthday:'1960-06-21',
                    category:'中名单',
                    nationality:'中国',
                    nation:'汉族'
                },
            ],

            loadingTable: false,
            total: 0,
            filter:{
                page: 1,
                size: 10
            }
        };
    },
    methods: {
        init () {

        },
        changePageInfo(filter) {
            this.filter = filter;
            this.getData()
        },
        getData () {
            this.loadingTable = true

            const page = this.filter.page
            const size = this.filter.size

            this.getRequest(`/monitor/list?size=${size}&page=${page}&keyWord=${this.keyWord}`).then(res => {
                const result = res.data
                this.loadingTable = false
                if(result.code === 0){
                    this.dataList = result.data.content
                    this.total = result.data.total
                } else {
                    this.$Loading.error()
                    this.dataList = []
                    this.total = 0
                }
            })
        }
    },
    mounted () {
        this.init();
    },
    created () {
        this.columnList = ufuserList.columnList
        this.columnList.forEach(item => {
            if (item.key === 'name') {
                item.render = (h, param) => {
                    const currentRowData = param.row
                    return h('a', {
                        on: {
                            click: () => {
                                const argu = { id: currentRowData.id };
                                this.$router.push({
                                    name: 'ufuser-edit',
                                    params: argu
                                });
                            }
                        }
                    },
                    currentRowData.name);
                };
            }
        });
    }
};
</script>

<style>

</style>
