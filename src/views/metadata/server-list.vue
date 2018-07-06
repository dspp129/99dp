<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row>
            <Select v-model="dbType" @on-change="resetSearch" clearable placeholder="数据库类型" style="width:100px">
                <Option v-for="item in dbTypeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
            </Select>
            <Input v-model="serverName" @on-enter="resetSearch" placeholder="请输入连接名..." style="width: 160px" />
            <Input v-model="jdbcUrl" @on-enter="resetSearch" placeholder="请输入 JDBC URL" style="width: 160px" />
            <Button type="primary" shape="circle" icon="search" @click="getData" :loading="loadingTable"></Button>
            <Button type="ghost" shape="circle" icon="loop" @click="resetFilter"></Button>
            <Dropdown  style="float: right" placement="bottom-end" @on-click="openAddWindow" trigger="click">
                <Button type="primary" shape="circle" icon="plus-round"></Button>
                <DropdownMenu slot="list">
                    <DropdownItem v-for="item in dbTypeList" v-if="item.isEtlSource" :name="item.id" :key="item.id">{{item.name}}</DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <Modal 
                width="700"
                v-model="addingWindow.show"
                class-name="modal-vertical-center"
                :title="addingWindow.title"
                :mask-closable="false">
                <Row type="flex" justify="center" align="middle" >
                    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" label-position="right" :label-width="80">
                        <FormItem label="连接名称" prop="name">
                            <Input v-model.trim="formValidate.name" placeholder="请输入连接名" style="width: 200px"></Input>
                        </FormItem>
                        <FormItem label="Jdbc Url" prop="jdbcUrl">
                            <Input v-model.trim="formValidate.jdbcUrl" placeholder="请输入 JDBC URL" style="width: 280px"></Input>
                        </FormItem>
                        <FormItem label="用户名" prop="username">
                            <Input v-model.trim="formValidate.username" placeholder="请输入用户名" style="width: 200px"></Input>
                        </FormItem>
                        <FormItem label="密码" prop="password">
                            <Input @input="formValidate.passwordChanged = true" v-model="formValidate.password" placeholder="请输入密码" type="password" style="width: 200px"></Input>
                        </FormItem>
                        <FormItem label="描述信息" prop="description">
                            <Input v-model="formValidate.description" type="textarea" :autosize="{minRows: 3, maxRows: 5}" placeholder="Please enter something" style="width: 280px"></Input>
                        </FormItem>
                    </Form>
                </Row>
                <div slot="footer">
                    <Button v-if="resetButton" type="ghost" shape="circle" icon="loop" @click="handleReset('formValidate')" ></Button>
                    <Button type="primary" shape="circle" icon="link" @click="toTestConnection" :loading="testing"></Button>
                    <Button type="success" shape="circle" icon="checkmark-round" @click="asyncOK" :model="submitButton" :disabled="!submitButton.addable" :loading="submitButton.loading"></Button>
                </div>
            </Modal>
        </Row>
        <Row class="margin-top-10">
            <Col>
                <TablePagination ref="serverList" :total="total" :size="filter.size" @on-page-info-change="changePageInfo">
                    <Table stripe border 
                    :columns="columnList" 
                    :data="tableList" 
                    :loading="loadingTable"
                    slot="table"
                    size="small" ></Table>
                </TablePagination>
            </Col>
        </Row>
    </div>
</template>

<script>

import TablePagination from '@/views/my-components/tablePagination'
import Util from '@/libs/util';

const deleteButton = (vm, h, currentRowData, index) => {
    return h('Poptip', {
        props: {
            //information-circled
            confirm: true,
            title: '您确定要删除这条数据吗?',
            transfer: true,
            placement: 'top-end'
        },
        on: {
            'on-ok': () => {
                vm.deleteRequest(`/metadata/server/${currentRowData.id}`).then(res=>{
                    const result = res.data;
                    if(result.code === 0){
                        vm.tableList.splice(index, 1)
                        vm.$Message.success('删除了第' + (index + 1) + '行数据')
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

const reviewButton = (vm, h, currentRowData) =>{
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
                    name: 'server-explorer',
                    params: argu
                });
            }
        }
    })
};

const editButton = (vm, h, currentRowData, index) =>{
    return h('Button', {
        props: {
            type: 'ghost',
            size: 'small',
            icon: 'edit',
            shape: 'circle'
        },
        style: {
            marginRight: '10px'
        },
        on: {
            click: () => {
                vm.handleReset('formValidate')
                vm.addingWindow.show = true
                vm.submitButton.loading = vm.submitButton.addable = false
                vm.addingWindow.title = '编辑 ' + vm.dbTypeMap.get(currentRowData.dbType).name
                vm.formValidate = JSON.parse(JSON.stringify(currentRowData))
                vm.formValidate.password = 'abcdef'
                vm.formValidate.passwordChanged = false
                vm.formValidate.index = index
                vm.resetButton = false
            }
        }
    })
};

const heartBeatIcon = (vm, h, currentRowData, index) =>{
    return h('Icon', {
        props: {
            size: 22,
            color: currentRowData.status === 0 ? '#19be6b' : '#ed3f14',
            type: currentRowData.status === 0 ? 'ios-pulse-strong' : 'heart-broken'
        }
    })
};

const initColumnList = [
    {
        key: 'status',
        title: '状态',
        align: 'center',
        width: 65,
        fixed: 'left'
    },
    {
        key: 'dbType',
        title: '数据库类型',
        width: 110,
        ellipsis: true
    },
    {
        key: 'name',
        title: '连接名称',
        width: 200,
        ellipsis: true
    },
    {
        key: 'jdbcUrl',
        title: 'JDBC URL',
        ellipsis: true
    },
    {
        key: 'username',
        title: '用户名',
        width: 150,
        ellipsis: true
    },
    {
        key: 'operation',
        title: '操作',
        align: 'center',
        width: 140,
        fixed: 'right'
    }
];

export default {
    name: 'server-list',
    components: {
        TablePagination
    },
    data () {
        return {
            loadingTable: false,
            submitButton: {
                loading: false,
                addable : false
            },
            resetButton: false,
            jdbcUrl: '',
            serverName: '',
            dbType : '',

            total:0,
            filter:{
                page: 1,
                size: 10
            },

            columnList: [],
            tableList: [],

            dbTypeList: [],
            dbTypeMap: new Map(),

            currentDb:{},

            testing: false,
            addingWindow: {
                show: false,
                title: ''
            },
            formValidate: {
                dbType: '',
                name: '',
                jdbcUrl: '',
                username: '',
                password:'',
                description: '',
                passwordChanged:false
            },
            ruleValidate: {
                name: [
                    { required: true, message: '必填项', trigger: 'blur' }
                ],
                jdbcUrl: [
                    { required: true, message: '必填项', trigger: 'blur' }
                ],
                username: [
                    { required: true, message: '必填项', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '必填项', trigger: 'blur' }
                ],
                description: [
                    { type: 'string', max: 200, message: 'Introduce no more than 200 words', trigger: 'blur' }
                ]
            }
        };
    },
    methods: {
        init () {
            this.columnList = initColumnList;
            this.columnList.forEach(item => {
                if (item.key === 'status') {
                    item.render = (h, param) => {
                        const currentRowData = this.tableList[param.index];
                        return h('a', {
                            on: {
                                click: () => {
                                    this.$Loading.start()
                                    setTimeout(() => {
                                        currentRowData.status = currentRowData.status===1?0:1
                                        this.$Loading.finish()
                                    }, 2000);
                                }
                            }
                        },
                        [
                            heartBeatIcon(this, h, currentRowData, param.index)
                        ]);
                    };
                }
                if (item.key === 'dbType') {
                    item.render = (h, param) => {
                        const currentRowData = this.tableList[param.index];
                        return h('span', this.dbTypeMap.get(currentRowData.dbType).name);
                    };
                }
                if (item.key === 'operation') {
                    item.render = (h, param) => {
                        const currentRowData = this.tableList[param.index];
                        return h('div', [
                            reviewButton(this, h, currentRowData),
                            editButton(this, h, currentRowData, param.index),
                            deleteButton(this, h, currentRowData, param.index)
                        ]);
                    };
                }
            });
        },
        resetFilter () {
            this.dbType = this.serverName = this.jdbcUrl = '';
        },
        resetSearch () {
            this.filter.page = 1
            this.getData()
        },
        getData(){
            this.loadingTable = true;
            this.$Loading.start()
            const page = this.filter.page - 1
            const size = this.filter.size
            const dbType = Util.formatNumber(this.dbType)

            this.getRequest(`/metadata/server/list?dbType=${dbType}&serverName=${this.serverName}&jdbcUrl=${this.jdbcUrl}&page=${page}&size=${size}`).then(res => {
                this.loadingTable = false
                const result = res.data
                if(result.code === 0){
                    this.$Loading.finish()
                    this.tableList = result.data.content
                    this.total = result.data.totalElements
                }
            })

        },
        openAddWindow(id){
            this.formValidate.dbType = id
            this.formValidate.index = -1
            this.formValidate.id = null
            this.formValidate.passwordChanged = false
            this.addingWindow.title = '新增 ' + this.dbTypeMap.get(id).name
            this.handleReset('formValidate')
            this.formValidate.jdbcUrl = this.dbTypeMap.get(id).jdbcUrlFormat;
            this.submitButton.loading = this.submitButton.addable = false
            this.addingWindow.show = true
            this.resetButton = true
        },
        handleReset (name) {
            this.$refs[name].resetFields()
            this.submitButton.loading = this.submitButton.addable = false;
        },
        toTestConnection(){
            this.$refs['formValidate'].validate(valid => {
                const newDb = JSON.parse(JSON.stringify(this.formValidate))
                if (valid) {
                    this.testing = true
                    this.$Loading.start()
                    setTimeout(() => {
                        this.postRequest('/metadata/server/test',newDb).then(res=>{
                            this.testing = false
                            const result = res.data;
                            if(result.code === 0){
                                this.submitButton.addable = true
                                this.$Message.success('连接成功！')
                                this.$Loading.finish()
                            } else {
                                this.submitButton.addable = false
                                this.$Message.error(result.msg)
                                this.$Loading.error()
                            }
                        })
                    }, 2000);
                } else {
                    this.$Message.error('请输入必填项!');
                }
            })
        },
        asyncOK () {
            this.submitButton.loading = true
            this.$Loading.start()
            setTimeout(() => {
                //重新渲染Table
                let newDb = JSON.parse(JSON.stringify(this.formValidate))
                newDb.status = 0
                if(newDb.index >= 0){
                    this.patchRequest('/metadata/server/save', newDb).then(res=>{
                        const result = res.data;
                        this.submitButton.loading = false
                        if(result.code === 0){
                            this.$Loading.finish()
                            this.addingWindow.show = false
                            this.$Message.success('操作成功！')
                            this.getData()
                        } else {
                            this.$Message.error(result.msg);
                            this.$Loading.error();
                        }
                    })
                } else {
                    this.postRequest('/metadata/server/add',newDb).then(res=>{
                        const result = res.data;
                        this.submitButton.loading = false;
                        if(result.code === 0){
                            this.$Loading.finish();
                            this.addingWindow.show = false;
                            this.resetSearch()
                            this.$Message.success('添加成功！')
                        } else {
                            this.$Message.error(result.msg);
                            this.$Loading.error();
                        }
                    })
                }
            }, 2000);
        },
        changePageInfo(filter) {
            this.filter = filter;
            this.getData()
        }
    },
    mounted () {
        this.getData()
    },
    created () {
        this.getRequest('/metadata/dbType').then(res =>{
            const result = res.data;
            if(result.code === 0){
                this.dbTypeList = result.data;
                this.dbTypeList.forEach(x => this.dbTypeMap.set(x.id, x));
                this.init();
            }
        })
    }
};
</script>
