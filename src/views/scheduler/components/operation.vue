<template>
    <Row>
        <Button 
            type="success"
            shape="circle"
            icon="checkmark-round"
            :disabled="disabled"
            @click="save" 
            style="float: right; margin-right: 10px; margin-left: 15px">
        </Button>

        <Poptip confirm
            title="您确定要删除这个任务吗?"
            transfer
            placement="top-end"
            @on-ok="remove"
            style="float: right;">
            <Button shape="circle" icon="android-delete" type="error"></Button>
        </Poptip>

    </Row>
</template>


<script>

export default {
    name: 'operation',
    props: {
        disabled: Boolean
    },
    data () {
        return {
            saveAble: this.disabled
        };
    },
    methods: {
        remove () {
            this.$emit("on-remove")
        },
        save () {
            this.$emit("on-save")
        }
    }
};
</script>

