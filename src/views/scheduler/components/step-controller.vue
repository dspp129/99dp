<template>
    <Row>
        <Button type="text" @click="prevStep" style="float: left;" v-show="value.current > 0">
            <Icon type="chevron-left"></Icon>
            <span class="margin-left-10">上一步</span>
        </Button>
        <template v-if="value.current < value.length - 1">
            <Button type="text" @click="nextStep" style="float: right;" :disabled="nextAble">
                <span class="margin-right-10">下一步
                    <Icon type="chevron-right" class="margin-left-10"></Icon>
                </span>
            </Button>
        </template>
        <template v-else>
            <Button type="text" @click="finish" style="float: right;" :disabled="nextAble">
                <span class="margin-right-10">完 成
                    <Icon type="checkmark" class="margin-left-10"></Icon>
                </span>
            </Button>
        </template>
    </Row>
</template>


<script>

export default {
    name: 'StepController',
    props: {
        value: Object,
        disabled: Boolean
    },
    data () {
        return {
            nextAble: this.disabled
        };
    },
    methods: {
        prevStep () {
            this.value.current -= 1
        },
        nextStep () {
            this.value.current += 1
        },
        finish(){
            this.$emit("on-create")
        }
    },
    watch : {
        'value.current' (current){
            if(current < 0) this.value.current = 0
            if(current > this.value.length) this.value.current = this.value.length
        },
        disabled (disabled){
            this.nextAble = disabled
        }
    }
};
</script>

