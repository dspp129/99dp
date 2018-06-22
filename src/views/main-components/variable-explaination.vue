<template>
    <div class="full-screen-btn-con">
        <Poptip trigger="hover" title="变量说明" placement="bottom-end">
            <Icon type="ios-help" :size="22"></Icon>
            <div slot="content">
                <Table :columns="columns1" :data="data1" size="small"></Table>
            </div>
        </Poptip>
    </div>
</template>

<script>
import moment from 'moment';
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
                    varVal: moment().add(-1, 'days').format('YYYY-MM-DD'),
                    varComment: '昨天'
                },
                {
                    varName: '${endDate}',
                    varVal: '无',
                    varComment: '手动指定'
                },
                {
                    varName: '${monthBegin}',
                    varVal: moment().add(-1, 'days').startOf('month').format('YYYY-MM-DD'),
                    varComment: '昨天所在月的第一天'
                },                {
                    varName: '${monthEnd}',
                    varVal: moment().add(-1, 'days').endOf('month').format('YYYY-MM-DD'),
                    varComment: '昨天所在月最后一天'
                },                {
                    varName: '${weekBegin}',
                    varVal: moment().add(-1, 'days').startOf('week').format('YYYY-MM-DD'),
                    varComment: '昨天所在周的周日'
                },                {
                    varName: '${weekEnd}',
                    varVal: moment().add(-1, 'days').endOf('week').format('YYYY-MM-DD'),
                    varComment: '昨天所在周的周六'
                },
                {
                    varName: '${onlyMonth}',
                    varVal: moment().add(-1, 'days').format('MM'),
                    varComment: '昨天所在的月份'
                }
            ]
        }
    },
    methods: {
    }
};
</script>