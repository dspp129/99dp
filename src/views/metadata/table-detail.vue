<style lang="less">
    @import '../../styles/common.less';
    @import './table-detail.less';
</style>

<template>
    <div>
        <Row :gutter="10">
            <Col span="17">
                <Card icon="ios-grid-view" title="表详情">
                    <Row>
                        <div style="float: right;">
                            <Tooltip placement="top" content="查看建表语句" :delay="500">
                                <Button 
                                shape="circle"
                                icon="code-working"
                                type="ghost"
                                @click="showSQL = true">
                                </Button>
                            </Tooltip>
                            <template v-if="!isEditing">
                                <Button
                                    shape="circle"
                                    icon="edit"
                                    type="ghost"
                                    @click="isEditing = true"
                                    class="margin-left-10"></Button>
                                <Poptip confirm
                                    title="您确定要删除这张表吗?"
                                    transfer
                                    placement="top-end"
                                    @on-ok="deleteTable">
                                    <Button shape="circle" icon="android-delete" type="error" class="margin-left-10"></Button>
                                </Poptip>
                            </template>
                            <template v-else>
                                <Poptip confirm
                                    title="您确定要放弃修改吗?"
                                    transfer
                                    placement="top-end"
                                    @on-ok="cancelEdit">
                                    <Button shape="circle" icon="close-round" type="ghost" class="margin-left-10"></Button>
                                </Poptip>
                                <Button 
                                    shape="circle"
                                    icon="checkmark-round"
                                    type="success"
                                    @click="saveTable"
                                    class="margin-left-10">
                                </Button>
                            </template>
                        </div>
                    </Row>

                    <Modal
                        v-model="showSQL"
                        title="查看建表语句"
                        scrollable
                        class-name="modal-vertical-center">
                        <pre>{{ table.createSql }}</pre>
                    </Modal>

                    <Modal
                        v-model="showSampleData"
                        title="查看Sample数据"
                        scrollable
                        width="auto"
                        class-name="modal-vertical-center">
                        <Table stripe border :columns="sampleColumns" :data="sampleData" size="small"></Table>
                    </Modal>

                    <Row>
                        <Col span="10">
                            <Form :label-width="120">
                                <FormItem label="数据库类型：">{{tableInfo.dbTypeName}}</FormItem>
                                <FormItem label="库名：">{{table.dbName}}</FormItem>
                                <FormItem label="表类型：">{{table.tableTypeName}}</FormItem>
                                <FormItem label="导入人：">{{tableInfo.dev}}</FormItem>
                                <FormItem label="使用中：">
                                    <template v-if="!isEditing">
                                        <Icon :type="table.isOffline === 0 ? 'android-checkbox-outline' : 'android-checkbox-outline-blank'" size="18"></Icon>
                                    </template>
                                    <template v-else>
                                        <i-switch v-model="table.isOffline === 0" @on-change="changeIsOffline">
                                            <Icon type="android-done" slot="open"></Icon>
                                            <Icon type="android-close" slot="close"></Icon>
                                        </i-switch>
                                    </template>
                                </FormItem>
                            </Form>
                        </Col>
                        <Col span="14">
                            <Form :label-width="100">
                                <FormItem label="连接名称：">{{tableInfo.serverName}}</FormItem>
                                <FormItem label="表名：">{{table.tableName}}</FormItem>
                                <FormItem label="核心表：">
                                    <template v-if="!isEditing">
                                        <Icon :type="table.isCore === 1 ? 'android-checkbox-outline' : 'android-checkbox-outline-blank'" size="18"></Icon>
                                    </template>
                                    <template v-else>
                                        <i-switch v-model="table.isCore === 1" @on-change="changeIsCore">
                                            <Icon type="android-done" slot="open"></Icon>
                                            <Icon type="android-close" slot="close"></Icon>
                                        </i-switch>
                                    </template>
                                </FormItem>
                                <FormItem label="业务负责人：">
                                    <template v-if="!isEditing">{{table.owner}}</template>
                                    <template v-else><Input v-model="table.owner" icon="person" style="width:200px"></Input></template>
                                </FormItem>
                                <FormItem label="负责人邮箱：">
                                    <template v-if="!isEditing">{{table.ownerEmail}}</template>
                                    <template v-else><Input v-model="table.ownerEmail" icon="email" style="width:200px"></Input></template>
                                </FormItem>
                            </Form>
                        </Col>
                        <Col span="22">
                            <Form :label-width="120">
                                <FormItem label="注解：">{{table.tableComment}}</FormItem>
                                <FormItem label="自定义描述：">
                                    <template v-if="!isEditing">
                                        <pre style="margin-top: 0px">{{table.tableDesc}}</pre>
                                    </template>
                                    <template v-else>
                                        <Input type="textarea" v-model="table.tableDesc" :autosize="{ minRows: 3}"></Input>
                                    </template>
                                </FormItem>
                            </Form>
                        </Col>
                    </Row>
                </Card>
            </Col>
            <Col span="7">
                <Card icon="ios-pricetags-outline" title="标签">
                    <Row>
                        <Col span="18">
                            <Select v-model="articleTagSelected" multiple @on-change="handleSelectTag" placeholder="请选择表标签">
                                <Option v-for="item in tableTagList" :value="item.value" :key="item.value">{{ item.value }}</Option>
                            </Select>
                        </Col>
                        <Col span="6" class="padding-left-10">
                            <Button v-show="!addingNewTag" @click="addingNewTag = true" long type="ghost">新建</Button>
                        </Col>
                    </Row>
                    <transition name="add-new-tag">
                        <div v-show="addingNewTag" class="add-new-tag-con">
                            <Col span="18">
                                <Input v-model="newTagName" placeholder="请输入标签名" icon="checkmark-round" @on-enter="createNewTag" @on-click="createNewTag"></Input>
                            </Col>
                            <Col span="6" class="padding-left-10">
                                <Button @click="cancelCreateNewTag" long type="ghost">取消</Button>
                            </Col>
                        </div>
                    </transition>
                </Card>
            </Col>
        </Row>

        <Row class="margin-top-10">
            <Card icon="ios-grid-view" title="字段详情">
                <canEditTable
                    v-model="dataList"
                    :edit-incell="true"
                    :hover-show="false"
                    :columns-list="columnList"
                    @on-cell-change="handleCellChange"
                    >
                </canEditTable>
            </Card>
        </Row>
    </div>
</template>

<script>
import canEditTable from './components/canEditTable.vue';
export default {
    name: 'table-detail',
    components: {
        canEditTable
    },
    data () {
        return {
            showTableInfo: false,
            showSQL: false,
            isEditing: false,
            createTableSQL: '',
            showSampleData:false,
            sampleColumns:[],
            sampleData:[],
            columnList:[],
            tableInfo: {},
            table:{},
            initTable:{},
            dataList:[],
            initDataList:[],
            tableTagList: [], // 所有标签列表
            articleTagSelected: [], // 文章选中的标签
            addingNewTag: false, // 添加新标签
            newTagName: '' // 新建标签名
        };
    },
    methods: {
        init () {
            const req = this.$route.params
            const id = req.id

            this.getRequest(`/metadata/table/${id}`).then(res=>{
                const result = res.data
                if(result.code===0){
                    this.tableInfo = result.data
                    this.table = this.tableInfo.table
                    this.initTable = JSON.parse(JSON.stringify(this.tableInfo.table))
                    this.dataList = this.tableInfo.columnList
                    this.initDataList = JSON.parse(JSON.stringify(this.tableInfo.columnList))
                } else {
                    this.$router.go(-1);
                }
            })
        },
        handleSelectTag () {
            localStorage.tagsList = JSON.stringify(this.articleTagSelected); // 本地存储文章标签列表
        },
        cancelCreateNewTag () {
            this.newTagName = '';
            this.addingNewTag = false;
        },
        createNewTag () {
            if (this.newTagName.length !== 0) {
                this.tableTagList.push({value: this.newTagName});
                this.addingNewTag = false;
                setTimeout(() => {
                    this.newTagName = '';
                }, 200);
            } else {
                this.$Message.error('请输入标签名');
            }
        },
        handleCellChange (val, index, key) {
            const column = this.dataList[index]
            column.columnDesc = val[index].columnDesc
            this.patchRequest('/metadata/column/save',column).then(res=>{
                const result = res.data
                if(result.code === 0){
                    this.$Message.success('成功修改第 ' + (index + 1) + ' 行数据');
                }
            })
        },
        deleteTable(){
            const id = this.table.id
            const pageName = 'table-detail'
            this.deleteRequest(`/metadata/table/${id}`).then(res=>{
                const result = res.data
                if(result.code===0){
                    this.$Message.success('删除成功')
                    this.$store.commit('removeTag', pageName)
                    this.$store.commit('closePage', pageName)
                    this.$router.go(-1);
                }
            })
        },
        changeIsOffline(val){
            this.table.isOffline = val ? 0 : 1;
        },
        changeIsCore(val){
            this.table.isCore = val ? 1 : 0;
        },
        cancelEdit(){
            this.isEditing = false
            this.table = JSON.parse(JSON.stringify(this.initTable))
        },
        saveTable(){
            this.$Loading.start()
            this.patchRequest('/metadata/table/save', this.table).then(res=>{
                const result = res.data
                if(result.code===0){
                    this.$Message.success('保存成功')
                    this.initTable = JSON.parse(JSON.stringify(this.table))
                    this.isEditing = false
                    this.$Loading.finish()
                }
            })
        }
    },
    created () {
        this.columnList = [
            {
                key: 'columnPosition',
                title: '序号',
                width: 65,
                align: 'center'
            },
            {
                key: 'columnName',
                title: '名称',
                width: 200
            },
            {
                key: 'columnType',
                title: '类型',
                width: 120,
                align: 'center'
            },
            {
                key: 'columnLength',
                title: '长度',
                width: 80,
                align: 'center'
            },
            {
                key: 'isNullable',
                title: '可为空',
                width: 80,
                align: 'center',
                render: (h, params) => {
                    const row = params.row
                    if(row.isNullable === 0) return;
                    return h('Icon', {
                        props: {
                            type: 'checkmark-round'
                        }
                    })
                }
            },
            {
                key: 'columnComment',
                title: '字段注解'
            },
            {
                key: 'columnDesc',
                title: '自定义描述',
                editable: true
            }
        ];
    },
    mounted () {
        this.tableTagList = [
            {value: 'vue'},
            {value: 'iview'},
            {value: 'ES6'},
            {value: 'webpack'},
            {value: 'babel'},
            {value: 'eslint'}
        ];
    },
    activated () {
        this.init();
    }
};
</script>
