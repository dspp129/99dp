<template>
    <Row :gutter="10" class="margin-top-10">
        <Col span="8">
            <Card icon="code-working" title="执行列表" :style="{minHeight}">
                <Button slot="extra" type="primary" icon="plus" shape="circle" size="small" @click="newItem"></Button>
                <div>
                    <ul id="sqlList" class="iview-admin-draggable-list">
                        <li v-for="(item, index) in value.sql" :key="index" class="notwrap todolist-item" @click="showItem(index,item)" :data-id="item.position">{{ item.name }}
                            <Poptip
                                confirm
                                transfer
                                placement="right"
                                title="您确认删除这条SQL吗？"
                                @on-ok="removeItem(index, item.position)"
                                style="float: right;">

                                <Button size="small" 
                                shape="circle" 
                                icon="trash-b" 
                                type="error"
                                ></Button>
                            </Poptip>
                        </li>
                    </ul>
                </div>
            </Card>
        </Col>
        <Col span="16">
            <Card icon="code-working" title="SQL详情">
                <Input v-model="task.name" ref="title">
                    <span slot="prepend">标题</span>
                </Input>
                <div style="border-radius:5px;border:1px solid #5cadff;width: 100%; margin-top: 20px;">
                    <editor v-model="task.content" 
                    @init="editorInit" 
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

import Sortable from 'sortablejs';
import Util from '@/libs/util';
import editor from 'vue2-ace-editor';

export default {
    name: 'sql-2',
    components: {
        editor
    },
    props : {
        value : Object
    },
    data () {
        return {
            task: {
                name:'',
                content:'',
                position: ''
            },
            sortable: {}
        };
    },
    methods : {
        showItem(index, item){
            this.task = item
        },
        newItem(){
            const length = this.value.sql.length 
            this.task = {
                name : '新建SQL-' + (length+1),
                content : '',
                position: length
            }
            this.value.sql.push(this.task)


        },
        removeItem(index, position){

            this.value.sql.splice(index, 1)

            this.$Message.success('删除成功')
            this.task = {
                name : '',
                content : ''
            }

            this.value.sql.forEach(s => {
                if(s.position > position) { 
                    s.position--
                }
            })

            this.$nextTick(() => {
                const order = Array.from( {length: this.value.sql.length} , (v,i) => {return i.toString();} )
                this.sortable.sort(order);
            });

        },
        editorInit () {
            require('brace/ext/searchbox')
            require('brace/ext/language_tools') //language extension prerequsite...
            require('brace/mode/sql')
            require('brace/theme/tomorrow')
            require('brace/snippets/sql') //snippet
        },
        endFunc (e) {

            if(e.oldIndex > e.newIndex){
                this.value.sql.forEach((s,index) => {
                    if(s.position == e.oldIndex) {s.position = e.newIndex}
                    else if(s.position >= e.newIndex && s.position < e.oldIndex) {s.position++}
                })
            }

            if(e.oldIndex < e.newIndex){
                this.value.sql.forEach((s,index) => {
                    if(s.position == e.oldIndex) {s.position = e.newIndex}
                    else if(s.position > e.oldIndex && s.position <= e.newIndex ) {s.position--}
                })
            }

        }
    },
    mounted () {

        document.body.ondrop = function (event) {
            event.preventDefault();
            event.stopPropagation();
        };

        let vm = this;
        let sqlList = document.getElementById('sqlList');
        this.sortable = Sortable.create(sqlList, {
            group: {
                name: 'list',
                pull: true
            },
            animation: 120,
            ghostClass: 'placeholder-style',
            fallbackClass: 'iview-admin-cloned-item',
            onEnd: vm.endFunc
        });
    },
    computed : {
        minHeight () {
            return window.innerHeight - 245 + 'px'
        },
        editorHeight () {
            const length = this.value.sql.length
            if(length < 7){
                return window.innerHeight - 385;
            } else {
                return length * 49 - 53
            }
        }
    },
    watch : {
        'value.id' (id) {
            this.task.name = ''
            this.task.content = ''
        }
    }
};
</script>

