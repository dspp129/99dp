<template>

    <div ref="scrollCon" @DOMMouseScroll="handlescroll" @mousewheel="handlescroll" class="tags-outer-scroll-con">
        <div ref="scrollBody" class="tags-inner-scroll-body dependency-parent-bar" :style="{left: tagBodyLeft + 'px'}">
            <Card v-for="record in recordList" class="dependency-child-bar" :key="record.recordId">
                <p slot="title">
                    <Icon style="float: left;margin-left: 2px;" 
                    :type="renderDependIcon(record)" 
                    size="22" 
                    :color="renderDependColor(record)"></Icon>
                    <span style="float: left;margin-left: 10px;" >
                        {{record.jobName}}
                    </span>
                </p>

                <a slot="extra" @click.prevent="lookupDependency(record)" v-if="hasExtra(record)">
                    <Icon :type="extra" size="22"></Icon>
                </a>
                <p>
                    <span>
                        <b>执行结果：</b>
                        <template v-if="record.status === -1">
                            <Tag color="blue">等 待</Tag>
                        </template>
                        <template v-else-if="record.status === -2">
                            <Tag color="blue">未开始</Tag>
                        </template>
                        <template v-else-if="record.status === 0">
                            <Tag color="yellow">执 行</Tag>
                        </template>
                        <template v-else>
                            <Tag v-show="record.success === 0" color="red">失 败</Tag>
                            <Tag v-show="record.success === 1" color="green">成 功</Tag>
                            <Tag v-show="record.success === 2" color="red">强 制</Tag>
                            <Tag v-show="record.success === 3" color="#80848f">超 时</Tag>
                            <Tag v-show="record.success === -1" color="default">未调度</Tag>
                        </template>
                    </span>
                    <span style="float: right;">
                        <b>执行方式：</b>
                        <Tag v-show="record.execType === 0" color="green">自 动</Tag>
                        <Tag v-show="record.execType === 1" color="blue">手 动</Tag>
                        <Tag v-show="record.execType === 2" color="yellow">手 动</Tag>
                        <Tag v-show="record.execType === 3" color="default">重 跑</Tag>
                        <Tag v-show="record.execType === 4" color="default">现 场</Tag>
                        <Tag v-show="record.execType === 5" color="default">强 制</Tag>
                    </span>
                </p>
                <p>计划时间：{{dateTimeFormat(record.fireTime)}}</p>
                <p>开始时间：{{dateTimeFormat(record.startTime)}}</p>
                <p>结束时间：{{dateTimeFormat(record.endTime)}}</p>
            </Card>
        </div>
    </div>
</template>

<script>

export default {
    name: 'scheduler-card',
    props: {
        recordList: {
            type: Array
        },
        stream: {
            type: String,
            default : ''
        }
    },
    data () {
        return {
            tagBodyLeft: 0,
            cardWidth: 315
        };
    },
    methods: {
        hasExtra (record) {
            return record.recordId > 0
        },
        lookupDependency(record){
            this.$emit('on-change', record.recordId)
        },
        renderDependColor(record){
            let color = ''

            if(record.status === -2){
                /* 未开始 */
                color='#5cadff'
            }else if(record.status === -1){
                /* 等待 */
                color='#ff9900'
            }else if(record.status === 0){
                /* 运行中 */
                color='#ff9900'
            }else if(record.success === 1){
                /* 成功 */
                color='#19be6b'
            }else if(record.success === 2){
                /* 强制 */
                color='#ed3f14'
            }else if(record.success === 3){
                /* 失败 */
                color='#ed3f14'
            }
            
            return color;
        },
        renderDependIcon(record){
            let icon = ''

            if(record.status === -2){
                /* 未开始 */
                icon = 'play'
            }else if(record.status === -1){
                /* 等待 */
                icon = 'ios-skipforward'
            }else if(record.status === 0){
                /* 运行中 */
                icon = 'load-a'
            }else if(record.success === 1){
                /* 成功 */
                icon = 'android-checkmark-circle'
            }else if(record.success === 2){
                /* 强制 */
                icon = 'android-hand'
            }else if(record.success === 3){
                /* 失败 */
                icon = 'close-round'
            }

            return icon
        },
        handlescroll (e) {
            e.preventDefault();
            const totalWidth = this.recordList.length * this.cardWidth - this.$refs.scrollCon.offsetWidth // 可偏移量 = 总宽度 - this.$refs.scrollCon.offsetWidth
            var type = e.type;
            let delta = 0;
            if (type === 'DOMMouseScroll' || type === 'mousewheel') {
                delta = (e.wheelDelta) ? e.wheelDelta : -(e.detail || 0) * 40;
            }
            let left = 0;
            if (delta > 0) {
                left = Math.min(0, this.tagBodyLeft + delta);
            } else {
                if (this.$refs.scrollCon.offsetWidth - totalWidth < this.$refs.scrollBody.offsetWidth) {
                    if (this.tagBodyLeft < -(this.$refs.scrollBody.offsetWidth - this.$refs.scrollCon.offsetWidth + totalWidth)) {
                        left = this.tagBodyLeft;
                    } else {
                        left = Math.max(this.tagBodyLeft + delta, this.$refs.scrollCon.offsetWidth - this.$refs.scrollBody.offsetWidth - totalWidth);
                    }
                } else {
                    this.tagBodyLeft = 0;
                }
            }
            this.tagBodyLeft = left;
        }
    },
    computed : {
        extra () {
            if(this.stream === 'up'){
                return 'arrow-up-c'
            } else if(this.stream === 'down'){
                return 'arrow-down-c'
            } else {
                return 'android-star'
            }
        }
    },
    mounted () {
    },
    created () {
    }
}


</script>