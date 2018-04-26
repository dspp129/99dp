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

                <a slot="extra" @click.prevent="lookupDependency(record)" v-if="hasExtra">
                    <Icon :type="extra"></Icon>
                </a>
                <p>调度方式：<Tag checkable color="blue">标签</Tag></p>
                <p>计划时间：{{record.fireTime}}</p>
                <p>开始时间：{{record.startTime}}</p>
                <p>结束时间：{{record.endTime}}</p>
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
            cardWidth: 375
        };
    },
    methods: {
        lookupDependency(record){
            this.$emit('on-change', record)
        },
        renderDependColor(depend){
            const now = Date.now()
            let color = ''

            if(depend.startTime === null && depend.endTime === null){
                if(depend.fireTime > now){
                    /* 未开始 */
                    color='#5cadff'
                }else{
                    /* 等待 */
                    color='#ff9900'
                }
            }
            if(depend.startTime != '' && depend.endTime === null){
                /* 运行中 */
                color='#ff9900'
            }
            if(depend.startTime != '' && depend.endTime != '' && depend.currentStatus === 3){
                /* 成功 */
                color='#19be6b'
            }
            if(depend.startTime != '' && depend.endTime != '' && depend.currentStatus > 3){
                /* 失败 */
                color='#ed3f14'
            }
            return color;
        },
        renderDependIcon(depend){
            const now = Date.now()
            let icon = ''

            if(depend.startTime === null && depend.endTime === null){
                if(depend.fireTime > now){
                    /* 未开始 */
                    icon = 'play'
                }else{
                    /* 等待 */
                    icon = 'ios-skipforward'
                }
            }
            if(depend.startTime != '' && depend.endTime === null){
                /* 运行中 */
                icon = 'load-a'
            }
            if(depend.startTime != '' && depend.endTime != '' && depend.currentStatus === 3){
                /* 成功 */
                icon = 'android-checkmark-circle'
            }
            if(depend.startTime != '' && depend.endTime != '' && depend.currentStatus > 3){
                /* 失败 */
                icon = 'close-round'
            }
            return icon
        },
        handlescroll (e) {
            e.preventDefault();
            console.log( this.stream + ' ' + this.recordList.length);
            const totalWidth = this.recordList.length * this.cardWidth - this.$refs.scrollCon.offsetWidth// 可偏移量 = 总宽度 - this.$refs.scrollCon.offsetWidth
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
        hasExtra () {
            return this.stream.length > 0
        },
        extra () {
            return 'chevron-' + this.stream
        }
    },
    mounted () {
        
    },
    created () {
    }
}


</script>