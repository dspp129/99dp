<style scoped>
    .expand-row{
        margin-bottom: 16px;
    }
</style>
<template>
    <div>
        <Row class="expand-row">
            <Col span="12">
                <span class="expand-key">负&nbsp;责&nbsp;人</span>
                <span class="expand-value">{{ row.taskOwner }}</span>
            </Col>
            <Col span="12">
                <span class="expand-key">开始时间</span>
                <span class="expand-value">{{ row.taskStartTime }}</span>
            </Col>
        </Row>
        <Row>
            <Col span="12">
                <span class="expand-key">计划时间</span>
                <span class="expand-value">{{ row.taskScheduleTime }}</span>
            </Col>
            <Col span="12">
                <span class="expand-key">结束时间</span>
                <span class="expand-value">{{ row.taskEndTime }}</span>
            </Col>
        </Row>
    </div>
</template>
<script>
    export default {
        props: {
            row: Object
        }
    };
</script>