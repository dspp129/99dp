<style lang="less">
    @import './styles/to-do-list-item.less';
</style>

<template>
    <Row class="to-do-list-item">
        <Col span="2" class="height-100">
            <Row type="flex" justify="center" align="middle" class="height-100">
                <Checkbox v-model="todoitem"></Checkbox>
            </Row>
        </Col>
        <Col span="20" class="height-100">
            <Row type="flex" justify="start" align="middle" class="height-100">
                <p class="to-do-list-item-text" @click="handleHasDid" :class="{hasDid: todoitem}">{{ content }}</p>
            </Row>
        </Col>
        <Col span="2" class="height-100">
            <Row type="flex" justify="center" align="middle" class="height-100">
                <a type="text" @click.prevent="edit">
                    <Icon type="edit"></Icon>
                </a>
            </Row>
        </Col>
    </Row>
</template>

<script>
export default {
    name: 'toDoListItem',
    data () {
        return {
            todoitem: false
        };
    },
    props: {
        content: String,
        id: Number
    },
    methods: {
        handleHasDid () {
            this.todoitem = !this.todoitem;
            this.$emit('on-toggle', this.id);
        },
        edit () {
            if(!this.todoitem) {
                this.$emit('on-edit', this.id);
            }
        }
    }
};
</script>