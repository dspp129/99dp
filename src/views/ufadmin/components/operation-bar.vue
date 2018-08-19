<template>
    <div>
        <Button type="success" @click="onSave" style="margin-right: 20px;">保　存</Button>
        <Button type="error" @click="onDelete" style="margin-right: 20px;">删　除</Button>
        <Button type="ghost" @click="onCancel" style="margin-right: 20px;">取　消</Button>
    </div>
</template>

<script>

export default {
    name: 'editable-table',
    props: {
    },
    data () {
        return {
        };
    },
    methods: {
        onSave(){
            this.$emit('on-save')
        },
        onDelete(){
            this.$Modal.confirm({
                title: '删除人物',
                content: '<p>您确定要删除该人物吗？</p>',
                okText: '删除',
                cancelText: '取消',
                onOk: () => {
                    this.$emit('on-delete')
                }
            });
        },
        onCancel(){
            this.$Modal.confirm({
                title: '放弃修改',
                content: '<p>您确定要放弃修改并关闭本页面吗？</p>',
                okText: '确定',
                cancelText: '取消',
                onOk: () => {
                    this.$emit('on-cancel')
                }
            });
        }
    },
    watch: {
        
    }
};

</script>