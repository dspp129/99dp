<template>
    <Select v-model.number="selectedId" @on-change="onChange" transfer :style="{width: width + 'px'}">
        <Option v-for="item in optionList" :value="item.id" :key="item.id">{{ item.label }}</Option>
    </Select>
</template>

<script>

export default {
    name: 'selector',
    props: {
        optionList: Array,
        value: {
            type: Number,
            default: 0
        } ,
        width: Number
    },
    data () {
        return {
            selectedId : this.value
        }
    },
    methods: {
        onChange (id) {
            this.$emit('on-change', id)
            this.$emit('input', id)
        }
    },
    watch : {
        value (id) {
            this.selectedId = id
        }
    }
}

</script>