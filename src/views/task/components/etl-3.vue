<template>
    <Row :gutter="10" class="margin-top-10">
        <Col span="6">
            <Card>
                <p slot="title">
                    <Icon type="flag"></Icon>
                    预处理
                </p>
                <Button slot="extra" type="primary" icon="plus" shape="circle" size="small" @click="newItem('pre')"></Button>
                <div>
                    <ul id="preList" class="iview-admin-draggable-list">
                        <li v-for="(item, index) in preList" :key="index" class="notwrap todolist-item" :data-index="index" @click="showItem('pre',index,item)">
                            Pre-{{index+1}} {{ item.name }}
                        </li>
                    </ul>
                </div>
            </Card>
            <Card class="margin-top-10">
                <p slot="title">
                    <Icon type="checkmark-circled"></Icon>
                    后处理
                </p>
                <Button slot="extra" type="primary" icon="plus" shape="circle" size="small" @click="newItem('post')"></Button>
                <div>
                    <ul id="postList" class="iview-admin-draggable-list">
                        <li v-for="(item, index) in postList" :key="index" class="notwrap todolist-item" :data-index="index" @click="showItem('post',index,item)">
                            Post-{{index+1}} {{ item.name }}
                        </li>
                    </ul>
                </div>
            </Card>
        </Col>
        <Col span="18">
            <Card>
                <p slot="title">
                    <Icon type="code-working"></Icon>
                    SQL
                </p>
                <ButtonGroup slot="extra" size="small" >
                    <Button type="dashed">Insert</Button>
                    <Button type="dashed">Delete</Button>
                    <Button type="dashed">Update</Button>
                    <Button type="dashed">Merge</Button>
                </ButtonGroup>
                <Poptip 
                    slot="extra"
                    confirm
                    transfer
                    placement="top-end"
                    title="您确认删除这条内容吗？"
                    @on-ok="removeItem"
                    class="padding-left-10">
                    <Button size="small" shape="circle" icon="trash-b" type="error" :disabled="removeButton"></Button>
                </Poptip>
                <Form label-position="right" :label-width="50">
                    <FormItem label="标题">
                        <Input v-model="task.name" :disabled="removeButton"></Input>
                    </FormItem>
                    <FormItem>
                        <Input v-model="task.content" type="textarea" :disabled="removeButton" :autosize="{minRows: 12}"></Input>
                    </FormItem>
                </Form>
            </Card>
        </Col>
    </Row>
</template>

<script>
import Sortable from 'sortablejs'

export default {
    name: 'draggable-list',
    data () {
        return {
            stepList1:[],
            currentStep:1,
            status: 'wait',
            removeButton:true,
            task: {
                name:'',
                content:'',
                position:'',
                index:-1
            },
            preList: [
                {   
                    name:'Truncate source tableA and replace some value',
                    content: '完成iview-admin基本开发'
                },
                {
                    name:'Delete',
                    content: '对iview-admin进行性能优化'
                }
            ],
            doArray: [],
            postList: [
                {name: '香肠', content: '完成iview-admin基本开发'},
                {name: '烤鸭', content: '完成iview-admin基本开发'}
            ],
            affordList: []
        };
    },
    methods : {
        showItem(position,index,item){
            this.task = item
            this.task.position = position
            this.task.index = index
            this.removeButton = false
            console.log(this.task)
        },
        newItem(position){
            const index = position === 'pre' ? this.preList.length : this.postList.length
            this.task = {
                name : '新建'+position,
                content : '',
                index: index,
                position : position
            }
            if(position === 'pre'){
                this.preList.push(this.task)
            } else {
                this.postList.push(this.task)
            }
            this.removeButton = false
        },
        removeItem(){
            const task = this.task
            if(task.position==='pre'){
                this.preList.splice(task.index, 1)
            }else{
                this.postList.splice(task.index, 1)
            }
            this.removeButton = true
            this.task = {
                name : '',
                content : ''
            }
        }
    },
    mounted () {
        document.body.ondrop = function (event) {
            event.preventDefault();
            event.stopPropagation();
        };
        let vm = this;
        
        let preList = document.getElementById('preList');
        Sortable.create(preList, {
            group: {
                name: 'list',
                pull: true
            },
            animation: 120,
            ghostClass: 'placeholder-style',
            fallbackClass: 'iview-admin-cloned-item',
            onRemove (event) {
                //vm.postList.splice(event.newIndex, 0, vm.preList[event.item.getAttribute('data-index')]);
                console.log('Pre removed.')
            },
            onUpdate(event){
                console.log('Pre updated.')
            },
            onSort(event){
                console.log('Pre sorted');
            },
            onAdd(event){
                console.log('Pre Added');
            }
        });
        let postList = document.getElementById('postList');
        Sortable.create(postList, {
            group: {
                name: 'list',
                pull: true
            },
            animation: 120,
            ghostClass: 'placeholder-style',
            fallbackClass: 'iview-admin-cloned-item',
            onRemove (event) {
                //vm.postList.splice(event.newIndex, 0, vm.preList[event.item.getAttribute('data-index')]);
                console.log('Post removed.')
            },
            onUpdate(event){
                console.log('Post updated.')
            },
            onSort(event){
                console.log('Post sorted');
            },
            onAdd(event){
                console.log('Post Added');
            }
        });
    }
};
</script>

