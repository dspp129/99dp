<template>
    <Row class="margin-top-10">
        <Col span="11">
            <Card icon="log-in" title="Source">
                <Row type="flex" justify="center" align="middle" >
                    <Form ref="value" 
                        :model="value" 
                        label-position="right" 
                        :label-width="70" 
                        style="margin-top: 70px; margin-bottom: 70px">

                        <FormItem v-for="(item, index) in value.sourceTableList"
                            :label="'来源表' + (index + 1)"
                            :key="index"
                            required>
                            <Input readonly 
                                v-model="item.tableFullName"
                                icon="edit"
                                placeholder="请点击图标编辑来源表"
                                @on-click="onOpenModal(index)"
                                style="width:250px">
                            </Input>
                            <template v-if="item.id > 0">
                                <Poptip 
                                    confirm
                                    transfer
                                    placement="top-end"
                                    title="您确认删除这张表吗？"
                                    class="margin-left-10"
                                    @on-ok="removeItem(index)">
                                    <Button size="small" 
                                        shape="circle" 
                                        icon="minus-round" 
                                        type="error"
                                        :disabled="index === 0">
                                    </Button>
                                </Poptip>
                            </template>
                            <template v-else>
                                <Button size="small" 
                                        shape="circle" 
                                        icon="minus-round" 
                                        type="error"
                                        class="margin-left-10"
                                        @click="removeItem(index)"
                                        :disabled="index === 0">
                                    </Button>
                            </template>
                        </FormItem>
                        <FormItem>
                            <Button 
                                type="dashed" 
                                long 
                                @click="handleAdd"
                                style="width:250px">
                                <Icon type="plus-round"></Icon>&nbsp;&nbsp;新增来源表
                            </Button>
                        </FormItem>
                    </Form>
                </Row>
            </Card>
        </Col>
        <Col span='2' style="text-align: center;line-height: 300px">
            <a>
                <Icon type="arrow-right-a" size="50"></Icon>
            </a>
        </Col>
        <Col span="11">
            <Card icon="log-out" title="Target">
                <Row type="flex" justify="center" align="middle">
                    <Form ref="value" 
                        :model="value" 
                        label-position="right" 
                        :label-width="70" 
                        style="margin-top: 70px; margin-bottom: 70px">
                        <FormItem label="目标表" prop="targetTableId" required>
                            <Input readonly 
                                v-model="targetTableFullName" 
                                icon="edit"
                                placeholder="请点击图标编辑目标表"
                                @on-click="onOpenTargetModal"
                                style="width:250px"></Input>
                        </FormItem>
                    </Form>
                </Row>
            </Card>
        </Col>
        <ChooseTable :title="title" v-model="showingModal" 
            @onChooseTable="onChooseTable"
            :dbTypeList="dbTypeList">
        </ChooseTable>
    </Row>
</template>

<script>
import ChooseTable from './chooseTable'

export default {
    name: 'sql-1',
    components: {
        ChooseTable
    },
    props :{
        value: Object,
        dbTypeList: Array
    },
    data () {
        return {
            showingModal: false,
            title: '',

            serverList:[],
            tableList:[]
        };
    },
    methods: {
        init () {
            if(this.value.sourceTableList.length === 0){
                this.handleAdd()
            }
        },
        removeItem (index) {
            this.value.sourceTableList.splice(index, 1)
        },
        handleAdd () {
            this.value.sourceTableList.push({tableFullName:''});
        },
        onChooseTable (source) {

            if(this.title.indexOf("目标表") > 0 ){
                this.changeTarget(source)
                return;
            }

            const id = source.tableId
            const index = Number(this.title.replace('编辑来源表','')) - 1
            if(this.value.sourceTableList.filter(x => x.id === id).length > 0){
                this.value.sourceTableList.splice(index, 1, {tableFullName:''})
                this.$Message.warning('该表已存在')
                return 
            }

            const tableFullName = source.dbName + '.' + source.tableName
            const table = {id, tableFullName}
            this.value.sourceTableList.splice(index, 1, table)
        },

        changeTarget (target) {
            this.value.targetDbType = target.dbType
            this.value.targetServerId = target.serverId
            this.value.targetDbId = target.dbId
            this.value.targetDbName = target.dbName
            this.value.targetTableId = target.tableId
            this.value.targetTableName = target.tableName
        },

        onOpenModal (index) {
            this.showingModal = true
            this.title = '编辑来源表' + (index + 1)
        },
        onOpenTargetModal(){
            this.showingModal = true
            this.title = '编辑目标表'
        }
    },
    computed : {
        targetTableFullName () {
            if(this.value.targetTableName.length > 0)
                return this.value.targetDbName + '.' + this.value.targetTableName
            else
                return ''
        }
    },
    mounted () {
        this.init()
    }
};


</script>