<template>
    <Row :gutter="10" class="margin-top-10">
        <Col span="6">
            <Card icon="flag" title="预处理">
                <Button slot="extra" type="primary" icon="plus" shape="circle" size="small" @click="newItem('Pre')"></Button>
                <div>
                    <ul id="value.preSql" class="iview-admin-draggable-list">
                        <li v-for="(item, index) in value.preSql" :key="index" class="notwrap todolist-item" :data-index="index" @click="showItem('Pre',index,item)">
                            Pre-{{index+1}} {{ item.name }}
                        </li>
                    </ul>
                </div>
            </Card>
            <Card icon="checkmark-circled" title="后处理" class="margin-top-10">
                <Button slot="extra" type="primary" icon="plus" shape="circle" size="small" @click="newItem('Post')"></Button>
                <div>
                    <ul id="value.postSql" class="iview-admin-draggable-list">
                        <li v-for="(item, index) in value.postSql" :key="index" class="notwrap todolist-item" :data-index="index" @click="showItem('Post', index, item)">
                            Post-{{index+1}} {{ item.name }}
                        </li>
                    </ul>
                </div>
            </Card>
        </Col>
        <Col span="18">
            <Card icon="code-working" title="SQL详情">
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
                    <Button size="small" shape="circle" icon="trash-b" type="error" :disabled="removable"></Button>
                </Poptip>
                <Input v-model="task.name" :readonly="removable">
                    <span slot="prepend">{{prepend}}</span>
                </Input>

                <div style="border-radius:5px;border:1px solid #5cadff;width: 100%; margin-top: 20px;">
                    <editor v-model="task.content" 
                    @init="initEditor" 
                    lang="sql" 
                    theme="tomorrow"
                    width="100%"
                    :height="editorHeight"></editor>
                </div>
            </Card>
        </Col>
    </Row>
</template>

<script>
import Sortable from 'sortablejs'
import editor from 'vue2-ace-editor'

export default {
    name: 'etl-3',
    components: {
        editor
    },
    props : {
        value : Object
    },
    data () {
        return {
            removable:true,
            task: {
                name:'',
                content:'',
                position:'',
                index:''
            }
        };
    },
    methods : {
        showItem(position, index, item){
            this.task = item
            this.task.position = position
            this.task.index = index
            this.removable = false
        },
        newItem(position){
            const index = position === 'Pre' ? this.value.preSql.length : this.value.postSql.length
            this.task = {
                name : '新建'+position,
                content : '',
                index: index,
                position : position
            }
            if(position === 'Pre'){
                this.value.preSql.push(this.task)
            } else {
                this.value.postSql.push(this.task)
            }
            this.removable = false
        },
        removeItem(){
            const task = this.task
            if(task.position === 'Pre') {
                this.value.preSql.splice(task.index, 1)
            } else {
                this.value.postSql.splice(task.index, 1)
            }
            this.removable = true
            this.task = {
                name : '',
                content : '',
                position: ''
            }
        },
        initEditor (editor) {
            require('brace/ext/searchbox')
            require('brace/ext/language_tools') //language extension prerequsite...
            require('brace/mode/sql')
            require('brace/theme/tomorrow')
            require('brace/snippets/text')
            require('brace/snippets/sql') //snippet

            editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: true
            });
            editor.resize()
        }
    },
    computed : {
        prepend () {
            if(this.task.position.length > 0){
                return this.task.position + '-' + (this.task.index + 1)
            } else {
                return '    '
            }
        },
        editorHeight () {
            const length = this.value.preSql.length + this.value.postSql.length
            if(length < 4){
                return window.innerHeight - 385;
            } else {
                return length * 49 - 53
            }
        }
    },
    mounted () {
        // document.body.ondrop = function (event) {
        //     event.preventDefault();
        //     event.stopPropagation();
        // };
        // let vm = this;
        
        // let value.preSql = document.getElementById('value.preSql');
        // Sortable.create(value.preSql, {
        //     group: {
        //         name: 'list',
        //         pull: true
        //     },
        //     animation: 120,
        //     ghostClass: 'placeholder-style',
        //     fallbackClass: 'iview-admin-cloned-item',
        //     onRemove (event) {
        //         //vm.value.postSql.splice(event.newIndex, 0, vm.value.preSql[event.item.getAttribute('data-index')]);
        //         console.log('Pre removed.')
        //     },
        //     onUpdate(event){
        //         console.log('Pre updated.')
        //     },
        //     onSort(event){
        //         console.log('Pre sorted');
        //     },
        //     onAdd(event){
        //         console.log('Pre Added');
        //     }
        // });
        // let value.postSql = document.getElementById('value.postSql');
        // Sortable.create(value.postSql, {
        //     group: {
        //         name: 'list',
        //         pull: true
        //     },
        //     animation: 120,
        //     ghostClass: 'placeholder-style',
        //     fallbackClass: 'iview-admin-cloned-item',
        //     onRemove (event) {
        //         //vm.value.postSql.splice(event.newIndex, 0, vm.value.preSql[event.item.getAttribute('data-index')]);
        //         console.log('Post removed.')
        //     },
        //     onUpdate(event){
        //         console.log('Post updated.')
        //     },
        //     onSort(event){
        //         console.log('Post sorted');
        //         console.log(this.value.postSql)
        //     },
        //     onAdd(event){
        //         console.log('Post Added');
        //     }
        // });
    }
};
</script>

