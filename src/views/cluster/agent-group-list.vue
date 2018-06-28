<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row>
            <div style="float: left;">
                <Input v-model="keyWord" @on-enter="resetSearch" placeholder="请输入执行器组名称..." style="width: 180px"></Input>
                <Button type="primary" shape="circle" icon="search" @click="resetSearch" :loading="loadingTable"></Button>
                <Button type="ghost" shape="circle" icon="loop" @click="resetFilter"></Button>
            </div>
            <div style="float: right;">
                <Button type="primary" shape="circle" icon="plus-round" @click="addAgentGroup"></Button>
            </div>
        </Row>
        <Row class="margin-top-10">
            <TablePagination :total="total" :size="filter.size" @on-page-info-change="changePageInfo">
                <Table stripe
                :columns="columnList" 
                :data="tableList" 
                :loading="loadingTable"
                slot="table"
                size="small"></Table>
            </TablePagination>
        </Row>
            <Modal
                v-model="showingWindow"
                :title="windowName"
                class-name="modal-vertical-center"
                :mask-closable="false"
                :closable="false">

                <Form ref="agentGroup" :model="agentGroup" :rules="ruleValidate" :label-width="160">
                    <FormItem label="执行器组名称" required prop="name">
                        <Input v-model.trim="agentGroup.name" 
                        :icon="icon"
                        @on-change="onChange"
                        style="width: 200px"></Input>
                    </FormItem>

                    <FormItem label="负责人">
                        <Select
                            v-model="agentGroup.userId"
                            style="width:100px;">
                            <Option v-for="item in userList" :value="item.id" :key="item.id">{{item.trueName}}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="备注">
                        <Input type="textarea" :autosize="{minRows: 3,maxRows: 5}" v-model="agentGroup.comment" style="width: 220px"></Input>
                    </FormItem>
                </Form>

                <div slot="footer">
                    <Button type="ghost" shape="circle" icon="close-round" @click="closeModal"></Button>
                    <Button type="success" shape="circle" icon="checkmark-round" @click="asyncOK" :loading="savingAgentGroup"></Button>
                </div>
            </Modal>
    </div>
</template>

<script>

const editButton = (vm, h, currentRowData) => {
    return h('Button', {
        props: {
            type: 'info',
            size: 'small',
            icon: 'edit',
            shape: 'circle'
        },
        style: {
            marginRight: '10px'
        },
        on: {
            click: () => {
                vm.agentGroup = JSON.parse(JSON.stringify(currentRowData))
                vm.windowName = '编辑执行器组'
                vm.openModal()
            }
        }
    })
};


const deleteButton = (vm, h, currentRowData, index) => {
    return h('Poptip', {
        props: {
            //information-circled
            confirm: true,
            title: '您确定要删除这个组吗?',
            transfer: true,
            placement: 'top-end'
        },
        on: {
            'on-ok': () => {
                // 判断是否有JobCount

                vm.deleteRequest('/cluster/agent-group/' + currentRowData.id).then(res=>{
                    const result = res.data
                    if(result.code === 0){
                        vm.tableList.splice(index, 1)
                        vm.$Message.success('删除了第' + (index + 1) + '行数据')
                    } else {
                        vm.$Message.error(result.msg)
                    }
                })
            }
        }
    }, [
        h('Button', {
            props: {
                type: 'error',
                size: 'small',
                icon: 'android-delete',
                shape: 'circle'
            }
        })
    ]);
};

const reviewButton = (vm, h, currentRowData) => {
    return h('Button', {
        props: {
            type: 'info',
            size: 'small',
            icon: 'search',
            shape: 'circle'
        },
        style: {
            marginRight: '10px'
        },
        on: {
            click: () => {
                const argu = { id: currentRowData.id };
                vm.$router.push({
                    name: 'agent-group-detail',
                    params: argu
                });
            }
        }
    })
};


const initColumnList = [
    {
        key: 'name',
        title: '执行器组名称',
        ellipsis: true
    },
    {
        key: 'userName',
        title: '负责人',
        align: 'center',
        ellipsis: true
    },
    {
        key: 'agentCount',
        title: '执行器数',
        align: 'center',
        width: 100
    },
    {
        key: 'jobCount',
        title: '任务数',
        align: 'center',
        width: 100
    },
    {
        key: 'comment',
        title: '注释'
    },
    {
        key: 'operation',
        title: '操作',
        align: 'center',
        width: 150,
        fixed: 'right'
    }
];



import TablePagination from '@/views/my-components/tablePagination'
import Util from '@/libs/util';

export default {
    name: 'agent-group-list',
    components: {
        TablePagination
    },
    data () {

        const validateName = (rule, value, callback) => {
            if (value.length === 0) {
                callback(new Error('请输入执行器名称'));
                return
            }

            this.getRequest(`/cluster/agent-group/checkName?name=${this.agentGroup.name}&id=${this.agentGroup.id}`).then(res=>{
                const result = res.data
                if(result.code === 0){
                    this.icon = 'checkmark'
                    callback();
                } else {
                    this.icon = 'close'
                    callback(new Error(result.msg))
                }
            })
        }

        return {
            loadingTable: false,
            showingWindow: false,
            windowName: '',
            savingAgentGroup: false,

            icon: '',

            keyWord: '',

            total:0,
            filter:{
                page: 1,
                size: 10
            },

            agentGroup: {},

            columnList: [],
            tableList: [],
            userList: [],

            ruleValidate: {
                name: [{ validator: validateName, trigger: 'blur' }]
            }

        };
    },
    methods: {
        init () {
            this.columnList = initColumnList;
            this.columnList.forEach(item => {

                if (item.key === 'name') {
                    item.render = (h, param) => {
                        const currentRowData = param.row
                        return h('a', {
                            on: {
                                click: () => {
                                    const argu = { id: currentRowData.id };
                                    this.$router.push({
                                        name: 'agent-group-detail',
                                        params: argu
                                    });
                                }
                            }
                        },
                        currentRowData.name);
                    };
                }

                if (item.key === 'operation') {
                    item.render = (h, param) => {
                        const currentRowData = this.tableList[param.index];
                        return h('div', [
                            reviewButton(this, h, currentRowData),
                            editButton(this, h, currentRowData),
                            deleteButton(this, h, currentRowData, param.index)
                        ]);
                    };
                }

            });
        },
        resetFilter () {
            this.keyWord = ''
        },
        changePageInfo(filter) {
            this.filter = filter;
            this.getData()
        },
        resetSearch () {
            this.filter.page = 1
            this.getData()
        },
        getData(){
            this.$Loading.start()
            this.loadingTable = true
            const page = this.filter.page - 1
            const size = this.filter.size

            this.$Loading.start()
            this.getRequest(`/cluster/agent-group/list?keyWord=${this.keyWord}&size=${size}&page=${page}`).then(res => {
                this.loadingTable = false
                const result = res.data;
                if(result.code === 0){
                    this.$Loading.finish()
                    this.tableList = result.data.content
                    this.total = result.data.totalElements
                }
            })
        },
        addAgentGroup () {
            this.agentGroup = { id : -1, name : '', comment : ''}
            this.windowName = '新增执行器组'
            this.openModal();
        },
        openModal () {
            this.showingWindow = true
            if(this.userList.length === 0){
                this.getRequest('/task/userList').then(res => {
                    const result = res.data
                    if(result.code === 0){
                        this.userList = result.data
                    }
                })
            }
        },
        closeModal () {
            this.showingWindow = false
            this.savingAgentGroup = false
            this.$refs.agentGroup.resetFields()
            this.icon = ''
        },
        asyncOK() {
            this.$refs.agentGroup.validate((valid) => {
                if (valid) {
                    this.savingAgentGroup = true
                    this.patchRequest('/cluster/agent-group/save', this.agentGroup).then(res => {
                        const result = res.data;
                        if(result.code === 0){
                            this.$Message.success('操作成功')
                            this.closeModal()
                            this.getData()
                        } else {
                            this.$Message.error(result.msg)
                        }
                    })
                } else {
                    this.$Message.error('Fail!');
                }
            })
        },
        onChange() {
            this.icon = ''
        }
    },
    activated () {
    },
    deactivated (){
    },
    mounted () {
        this.getData()
    },
    created () {
        this.init()
    },
    watch : {

    }
};
</script>