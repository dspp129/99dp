<style scoped>
    .expand-row{
        margin-bottom: 16px;
    }
    .expand-value{
        margin-left: 20px;
    }
</style>
<template>
    <div>
        <Row class="expand-row">
            <Col span="12">
                <span class="expand-key">任务类型</span>
                <span class="expand-value" >{{ row.taskTypeName }}</span>
            </Col>
            <Col span="12">
                <span class="expand-key">开始时间</span>
                <span class="expand-value">{{ dateFormat(row.startTime) }}</span>
            </Col>
        </Row>
        <Row>
            <Col span="12">
                <span class="expand-key">计划时间</span>
                <span class="expand-value">{{ dateFormat(row.nextFireTime) }}</span>
            </Col>
            <Col span="12">
                <span class="expand-key">结束时间</span>
                <span class="expand-value">{{ dateFormat(row.endTime) }}</span>
            </Col>
        </Row>
    </div>
</template>
<script>
import moment from 'moment'

    export default {
        props: {
            row: Object
        },
        methods : {
            dateFormat(timestamp){
                const reg = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s+(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;
                const regExp = new RegExp(reg)
                const datetime = moment(timestamp).format('YYYY-MM-DD HH:mm:ss')

                if(regExp.test(datetime)){
                    return datetime
                } else {
                    return ''
                }
            }
        }
    };
</script>