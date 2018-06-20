<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Button type="primary"  @click="click">123</Button>
    </div>
</template>

<script>

export default {
    name: 'agent-list',
    components: {
        
    },
    methods: {
        click () {
            this.$router.push({name: 'error-403'});
        }
    }
}

</script>