<template>
    <div @click="openExplaination" class="full-screen-btn-con">
        <Poptip title="变量说明" placement="bottom-end">
            <Icon type="ios-help" :size="22"></Icon>
            <div slot="content">
                <Table :columns="columns1" :data="data1" size="small"></Table>
            </div>
        </Poptip>
    </div>
</template>


<script>
export default {
    name: 'openExplaination',
    props: {
        value: {
            type: Boolean,
            default: false
        }
    },
     data () {
        return {
            columns1: [
                {
                    title: '变量名称',
                    key: 'varName',
                    width: 120
                },
                {
                    title: '替换值',
                    key: 'varVal',
                    width: 120
                },
                {
                    title: '说明',
                    key: 'varComment',
                    width: 200
                }
            ],
            data1: [
                {
                    varName: '${startDate}',
                    varVal: '2018-06-05',
                    varComment: '昨天'
                },
                {
                    varName: 'Jim Green',
                    varVal: 24,
                    varComment: 'London No. 1 Lake Park'
                },
                {
                    varName: 'Joe Black',
                    varVal: 30,
                    varComment: 'Sydney No. 1 Lake Park'
                },
                {
                    varName: 'Jon Snow',
                    varVal: 26,
                    varComment: 'Ottawa No. 2 Lake Park'
                }
            ]
        }
    },
    methods: {
        openExplaination () {
        }
    }
};
</script>