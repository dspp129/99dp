<template>
    <Card class="dependency-child-bar">
        <p slot="title">
            <Icon style="float: left;margin-left: 2px;" :type="icon" size="22" :color="color"></Icon>
            <span style="float: left;margin-left: 10px;" >
                record.taskName
            </span>
        </p>

        <a slot="extra" @click.prevent="lookupDependency" v-if="hasExtra">
            <Icon :type="extra"></Icon>
        </a>
        <p>调度方式：<Tag checkable color="blue">标签</Tag></p>
        <p>计划时间：2018-01-01 20:22:33</p>
        <p>开始时间：2018-01-01 20:22:33</p>
        <p>结束时间：2018-01-01 20:22:33</p>
    </Card>
</template>

<script>


export default {
    name: 'scheduler-card',
    props: {
        record: {
            type: Object
        },
        stream: {
            type: String,
            default : ''
        }
    },
    data () {
        return {
            icon: '',
            color: ''
        };
    },
    methods: {
        lookupDependency(){
            this.$emit('on-change', record.recordid)
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
        this.icon = 'android-checkmark-circle'
        this.color = '#ff9900'
    },
    created () {
    }
}


</script>