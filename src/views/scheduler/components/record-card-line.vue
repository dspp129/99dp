<template>
    <div ref="scrollCon" @DOMMouseScroll="handlescroll" @mousewheel="handlescroll" class="tags-outer-scroll-con">
        <div ref="scrollBody" class="tags-inner-scroll-body dependency-parent-bar" :style="{left: tagBodyLeft + 'px'}">
            <Card v-for="record in recordList" class="dependency-child-bar" :key="record.jobId">
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
                            <Tag color="blue"><Icon type="android-time"></Icon> 等 待</Tag>
                        </template>
                        <template v-else-if="record.status === -2">
                            <Tag color="blue">未开始</Tag>
                        </template>
                        <template v-else-if="record.status === 0">
                            <Tag color="yellow"><Icon type="load-a"></Icon> 执 行</Tag>
                        </template>
                        <template v-else>
                            <Tag v-show="record.success === 0" color="red"><Icon type="close-round"></Icon> 失 败</Tag>
                            <Tag v-show="record.success === 1" color="green"><Icon type="checkmark-round"></Icon> 成 功</Tag>
                            <Tag v-show="record.success === 2" color="red"><Icon type="android-hand"></Icon> 被 杀</Tag>
                            <Tag v-show="record.success === 3" color="#80848f"><Icon type="android-stopwatch"></Icon>  超 时</Tag>
                            <Tag v-show="record.success === 5" color="#80848f"><Icon type="power"></Icon> 取 消</Tag>
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
                <p class="margin-top-5"><span><b>计划时间：</b>{{formatDateTime(record.fireTime)}}</span></p>
                <p class="margin-top-5"><span><b>开始时间：</b>{{formatDateTime(record.startTime)}}</span></p>
                <p class="margin-top-5"><span><b>结束时间：</b>{{formatDateTime(record.endTime)}}</span></p>
            </Card>
        </div>
    </div>
</template>

<script>

import Util from '@/libs/util'

export default {
    name: 'record-card-line',
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
            card: {
                width: 300,
                space: 20
            }
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
            const totalWidth = this.recordList.length * ( this.card.width + this.card.space ) - this.$refs.scrollCon.offsetWidth // 可偏移量 = 总宽度 - this.$refs.scrollCon.offsetWidth
            const type = e.type;
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
                    left = 0;
                }
            }
            this.tagBodyLeft = left;
        },
        formatDateTime(t){
            return Util.formatDateTime(t)
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