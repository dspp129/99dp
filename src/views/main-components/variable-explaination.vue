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
                    title: '默认值',
                    key: 'varVal',
                    width: 120
                },
                {
                    title: '注解',
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
                    varName: '${endDate}',
                    varVal: '无',
                    varComment: '手动指定'
                },
                {
                    varName: '${monthBegin}',
                    varVal: '2018-06-01',
                    varComment: '昨天所在月的第一天'
                },                {
                    varName: '${monthEnd}',
                    varVal: '2018-06-30',
                    varComment: '昨天所在月最后一天'
                },                {
                    varName: '${weekBegin}',
                    varVal: '2018-06-03',
                    varComment: '昨天所在周的周日'
                },                {
                    varName: '${weekEnd}',
                    varVal: '2018-06-09',
                    varComment: '昨天所在周的周六'
                },
                {
                    varName: '${onlyMonth}',
                    varVal: '06',
                    varComment: '昨天所在的月份'
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