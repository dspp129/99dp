<template>
    <Row>
        <Button type="text" @click="prevStep" style="float: left;" v-show="current > 0">
            <Icon type="chevron-left"></Icon>
            <span class="margin-left-10">上一步</span>
        </Button>
        <template v-if="current < length - 1">
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
        stepLength: Number,
        currentStep: Number,
        disabled: Boolean
    },
    data () {
        return {
            current: this.currentStep,
            length: this.stepLength,
            nextAble: this.disabled
        };
    },
    methods: {
        prevStep () {
            this.current -= 1
        },
        nextStep () {
            this.current += 1
        },
        finish(){
            this.$emit("on-save")
        }
    },
    watch : {
        current (current){
            if(current < 0) this.current = 0
            if(current > this.length) this.current = this.length
            this.$emit("on-step-change", current)
        },
        currentStep (currentStep){
             this.current = currentStep
        },
        disabled (disabled){
            this.nextAble = disabled
        }
    }
};
</script>

