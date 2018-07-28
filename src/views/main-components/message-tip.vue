<template>
    <div @click="showMessage" class="message-con">
        <Tooltip :content="content" placement="bottom">
            <Badge :count="value" dot>
                <Icon type="ios-bell" size="22"></Icon>
                <!--
                <Icon type="android-mail"></Icon>
                <Icon type="android-drafts"></Icon>
                -->
            </Badge>
        </Tooltip>
    </div>
</template>

<script>

export default {
    name: 'messageTip',
    props: {
        value: {
            type: Number,
            default: 0
        }
    },
    methods: {
        showMessage () {
            this.$router.push({
                name: 'message_index'
            });
        }
    },
    computed: {
        content () {
            if(this.value > 0){
                return '有' + this.value + '条未读消息'
            } else {
                return '无未读消息'
            }
        }
    }
};
</script>
