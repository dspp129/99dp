<template>
    <Row :gutter="10" class="margin-top-10">
        <Col span="6">
            <Card style="min-height: 404px;">
                <p slot="title">
                    <Icon type="code-working"></Icon>
                    执行列表
                </p>
                <Button slot="extra" type="primary" icon="plus" shape="circle" size="small" @click="newItem"></Button>
                <div>
                    <ul id="value.sql" class="iview-admin-draggable-list">
                        <li v-for="(item, index) in value.sql" :key="index" class="notwrap todolist-item" :data-index="index" @click="showItem(index,item)">
                            {{ item.name }}
                        </li>
                    </ul>
                </div>
            </Card>
        </Col>
        <Col span="18">
            <Card>
                <p slot="title">
                    <Icon type="code-working"></Icon>
                    SQL详情
                </p>
                <Poptip 
                    slot="extra"
                    confirm
                    transfer
                    placement="top-end"
                    title="您确认删除这条内容吗？"
                    @on-ok="removeItem"
                    class="padding-left-10">
                    <Button size="small" shape="circle" icon="trash-b" type="error" :disabled="removable"></Button>
                </Poptip>
                <Input v-model="task.name" :readonly="removable">
                    <span slot="prepend">标题</span>
                </Input>
                <Input class="margin-top-20" v-model="task.content" type="textarea" :readonly="removable" :autosize="{minRows: 12}" ></Input>
            </Card>
        </Col>
    </Row>
</template>

<script>
import Sortable from 'sortablejs'

export default {
    name: 'sql-2',
    props : {
        value : Object
    },
    data () {
        return {
            removable:true,
            task: {
                name:'',
                content:'',
                index:''
            }
        };
    },
    methods : {
        showItem(index, item){
            this.task = item
            this.task.index = index
            this.removable = false
        },
        newItem(){
            const index = this.value.sql.length 
            this.task = {
                name : '新建SQL-' + (index+1),
                content : '',
                index: index
            }
            this.value.sql.push(this.task)
            this.removable = false
        },
        removeItem(){
            const task = this.task

            this.value.sql.splice(task.index, 1)

            this.removable = true
            this.task = {
                name : '',
                content : ''
            }
        }
    },
    computed : {
    },
    mounted () {
    }
};
</script>

