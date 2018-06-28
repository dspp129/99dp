<template>
    <div @click="showVariable" class="full-screen-btn-con">
        <Tooltip content="变量说明" placement="bottom">
            <Icon type="ios-help" size="22"></Icon>
        </Tooltip>

        <!--
        <Poptip trigger="hover" title="变量说明" placement="bottom-end">
            <Icon type="ios-help" :size="22"></Icon>
            <div slot="content">
                <Table :columns="columns1" :data="data1" size="small"></Table>
            </div>
        </Poptip>
        -->

        <Modal v-model="showingWindow" class-name="modal-vertical-center">
            <p slot="header" style="color:#2d8cf0;text-align:center;">
                <Icon type="information-circled"></Icon>
                <span>变量说明</span>
            </p>
            <Table :columns="columns1" :data="data1" size="small" height="310"></Table>
            <div slot="footer">
            </div>
            <p slot="footer" style="color:#80848f;text-align: center;">
                需要更多变量？请联系管理员。
            </p>
        </Modal>

    </div>
</template>

<script>
import moment from 'moment';
export default {
    name: 'variable-explaination',
    props: {
        value: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            showingWindow: false,

            columns1: [
                {
                    title: '变量名称',
                    key: 'varName',
                    width: 140
                },
                {
                    title: '默认值',
                    key: 'varVal',
                    width: 140
                },
                {
                    title: '注解',
                    key: 'varComment'
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
                    varVal: moment().add(0, 'days').format('YYYY-MM-DD'),
                    varComment: '${startDate}的第二天'
                },
                {
                    varName: '${startMonth}',
                    varVal: moment().add(-1, 'days').startOf('month').format('YYYY-MM-DD'),
                    varComment: '昨天所在月的第一天'
                },
                {
                    varName: '${endMonth}',
                    varVal: moment().add(-1, 'days').endOf('month').format('YYYY-MM-DD'),
                    varComment: '昨天所在月最后一天, 如果指定了${endDate}则为指定月份的最后一天'
                },
                {
                    varName: '${shortDate}',
                    varVal: moment().add(-1, 'days').format('YYYYMMDD'),
                    varComment: '短日期'
                },
                {
                    varName: '${shortMonth}',
                    varVal: moment().add(-1, 'days').startOf('month').format('YYYYMM'),
                    varComment: '短月份'
                },
                {
                    varName: '${startWeek}',
                    varVal: moment().add(-1, 'days').startOf('week').format('YYYY-MM-DD'),
                    varComment: '昨天所在周的周日'
                },                {
                    varName: '${endWeek}',
                    varVal: moment().add(-1, 'days').endOf('week').format('YYYY-MM-DD'),
                    varComment: '昨天所在周的周六'
                },
                {
                    varName: '${onlyYear}',
                    varVal: moment().add(-1, 'days').format('YYYY'),
                    varComment: '年'
                },
                {
                    varName: '${onlyMonth}',
                    varVal: moment().add(-1, 'days').format('MM'),
                    varComment: '月'
                },
                {
                    varName: '${onlyDay}',
                    varVal: moment().add(-1, 'days').format('DD'),
                    varComment: '日'
                }
            ]
        }
    },
    methods: {
        showVariable(){
            this.showingWindow = true
        }
    }
};
</script>