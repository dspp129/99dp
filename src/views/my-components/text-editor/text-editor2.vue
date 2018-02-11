<style lang="less">
    @import '../../../styles/loading.less';
</style>

<template>
    <div>
        <Card>
            <Row>
                <div style="float: left;">
                    <Input icon="search" placeholder="请输入检索条件..." style="width: 300px"></Input>
                    <Button icon="search" type="primary">高级检索</Button>
                </div>
                <div style="float: right;">
                    <Page :total="100" show-sizer></Page>
                </div>
            </Row>
            <Row style="margin-top: 10px">
                <Table stripe :columns="columnList" :data="dataList" size="small"></Table>
            </Row>
        </Card>
        
        <Spin fix v-if="spinShow">
            <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
            <div>加载组件中...</div>
        </Spin>
    </div>
</template>

<script>
import tinymce from 'tinymce';
export default {
    name: 'text-editor',
    data () {
        return {
            spinShow: false,
            columnList:[
                    {
                        title: '姓名',
                        key: 'name'
                    },
                    {
                        title: '性别',
                        key: 'sex',
                        width: 60
                    },
                    {
                        title: '出生年月',
                        key: 'birthday'
                    },
                    {
                        title: '名单类别',
                        key: 'category'
                    },
                    {
                        title: '现任社会职务',
                        key: 'position',
                        ellipsis: true
                    },
                    {
                        title: '党派',
                        key: 'dangpai'
                    },
                    {
                        title: '党派内职务',
                        key: 'dangpaizhiwu',
                        ellipsis: true
                    },
                    {
                        title: '国籍',
                        key: 'nationality'
                    },
                    {
                        title: '民族',
                        key: 'nation'
                    },
                    {
                        title: '籍贯',
                        key: 'nativeplace'
                    },
                    {
                        title: '宗教信仰',
                        key: 'religion'
                    }
                ],
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
            ]
        };
    },
    methods: {
        init () {

        }
    },
    mounted () {
        this.init();
    }
};
</script>

<style>

</style>
