<style lang="less">
    @import '../../styles/common.less';
    @import './components/table.less';
</style>

<template>
    <div>
        <Spin fix v-if="loadingPage" size="large">
            <!--
            <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
            <div>加载组件中...</div>
        -->
        </Spin>
        <Row>
            <Select v-if="false" v-model="selectDBType" @on-change="handleSearch" clearable placeholder="请选择数据库类型..." style="width:200px">
                <Option v-for="item in dbTypeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
            </Select>
            <Input v-model="searchConnectionName" @on-change="handleSearch" icon="search" placeholder="请输入连接名..." style="width: 200px" />
            <Input v-model="searchIP" @on-change="handleSearch" icon="search" placeholder="请输入IP地址..." style="width: 200px" />
            <Button type="ghost" shape="circle" icon="refresh" @click="resetSearch" :loading="reseting"></Button>
            <Dropdown  style="float: right" placement="bottom-end" @on-click="openAddWindow" trigger="click">
                <Button type="primary" shape="circle" icon="plus-round"></Button>
                <DropdownMenu slot="list">
                    <DropdownItem v-for="item in dbTypeList" :name="item.id" :key="item.id">{{item.name}}</DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <Modal 
                v-model="addingWindow.show"
                class-name="vertical-center-modal"
                :title="addingWindow.title"
                :mask-closable="false">
                <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" label-position="right" :label-width="150">
                    <FormItem label="连接名称" prop="name">
                        <Input v-model.trim="formValidate.name" placeholder="请输入连接名" style="width: 200px"></Input>
                    </FormItem>
                    <FormItem label="IP地址" prop="ip">
                        <Input v-model.trim="formValidate.ip" placeholder="请输入IP地址" style="width: 200px"></Input>
                    </FormItem>
                    <FormItem label="端口号" prop="port">
                        <InputNumber v-model.number="formValidate.port" :max="99999" :min="0" style="width: 100px"></InputNumber>
                    </FormItem>
                    <FormItem label="默认数据库" prop="defaultDatabase">
                        <Input v-model.trim="formValidate.defaultDatabase" placeholder="请输入数据库名" style="width: 200px"></Input>
                    </FormItem>
                    <FormItem label="用户名" prop="username">
                        <Input v-model.trim="formValidate.username" placeholder="请输入用户名" style="width: 200px"></Input>
                    </FormItem>
                    <FormItem label="密码" prop="password">
                        <Input @input="formValidate.passwordChanged = true" v-model="formValidate.password" placeholder="请输入密码" type="password" style="width: 200px"></Input>
                    </FormItem>
                    <FormItem label="描述信息" prop="description">
                        <Input v-model="formValidate.description" type="textarea" :autosize="{minRows: 3, maxRows: 5}" placeholder="Please enter something" style="width: 250px"></Input>
                    </FormItem>
                </Form>
                <div slot="footer">
                    <Button v-if="resetButton" type="ghost" shape="circle" icon="loop" @click="handleReset('formValidate')" ></Button>
                    <Button type="primary" shape="circle" icon="link" @click="toTestConnection" :model="testingButton" :loading="testingButton.testing"></Button>
                    <Button type="success" shape="circle" icon="checkmark-round" @click="asyncOK" :model="submitButton" :disabled="!submitButton.addable" :loading="submitButton.loading"></Button>
                </div>
            </Modal>

            <Modal
                v-model="showingWindow"
                :title="currentDb.name">
                <table>
                    <tr><th style="text-align: right">数据库类型</th><td>{{currentDb.dbType}}</td></tr>
                    <tr><th style="text-align: right">IP</th><td>{{currentDb.ip}}</td></tr>
                    <tr><th style="text-align: right">端口</th><td>{{currentDb.port}}</td></tr>
                    <tr><th style="text-align: right">默认数据库</th><td>{{currentDb.defaultDatabase}}</td></tr>
                    <tr><th style="text-align: right">用户名</th><td>{{currentDb.username}}</td></tr>
                    <tr><th style="text-align: right">密码</th><td>******</td></tr>
                    <tr><th style="text-align: right">状态</th><td><span v-if="currentDb.status === 1">在线</span><span v-else>失联</span></td></tr>
                    <tr><th style="text-align: right">检测时间</th><td>2017-01-22 10:00:00</td></tr>
                    <tr><th style="text-align: right">创建者</th><td>{{currentDb.createdby}}</td></tr>
                    <tr><th style="text-align: right">创建时间</th><td>2017-01-22 10:00:00</td></tr>
                    <tr><th style="text-align: right">上次修改者</th><td>{{currentDb.updatedby}}</td></tr>
                    <tr><th style="text-align: right">修改时间</th><td>2017-01-22 10:00:00</td></tr>
                </table>
                <div slot="footer"></div>
            </Modal>
        </Row>
        <Row class="margin-top-10">
            <Table stripe border :columns="columnList" :data="dbList" size="small" :loading="reseting"></Table>
        </Row>
    </div>
</template>

<script>

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
                vm.$http.delete('/api/metadata/server/'+currentRowData.id).then(res=>{
                    vm.dbList.splice(index, 1)
                    vm.initDbList = vm.initDbList.filter(x => x != currentRowData)
                    vm.alertSuccess('删除了第' + (index + 1) + '行数据')
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
                if(currentRowData.dbType <= 2){
                    let argu = { id: currentRowData.id };
                    vm.$router.push({
                        name: 'server-explorer',
                        params: argu
                    });
                }else {
                    console.log(currentRowData);
                    vm.currentDb = currentRowData
                    vm.showingWindow = true
                }
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
        ellipsis: true
    },
    {
        key: 'ip',
        title: 'IP地址',
        ellipsis: true
    },
    {
        key: 'port',
        title: '端口号',
        align: 'center',
        width: 80
    },
    {
        key: 'defaultDatabase',
        title: '默认数据库',
        ellipsis: true
    },
    {
        key: 'username',
        title: '用户名',
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
    name: 'server-manager',
    data () {
        return {
            loadingPage:true,
            submitButton: {
                loading: false,
                addable : false
            },
            resetButton: false,
            searchConnectionName: '',
            searchIP: '',
            selectDBType : '',
            reseting: false,

            columnList: [],
            dbList: [],
            initDbList: [],

            dbTypeList: [],
            dbTypeMap: new Map(),

            showingWindow: false,
            currentDb:{},

            testingButton:{ testing: false },
            addingWindow: {
                show: false,
                title: ''
            },
            formValidate: {
                dbType: '',
                name: '',
                ip: '',
                port: 0,
                defaultDatabase: '',
                username: '',
                password:'',
                description: '',
                passwordChanged:false
            },
            ruleValidate: {
                name: [
                    { required: true, message: '连接名不能为空', trigger: 'blur' }
                ],
                ip: [
                    { required: true, message: 'IP地址不能为空', trigger: 'blur' }
                ],
                defaultDatabase: [
                    { required: true, message: '数据库名不能为空', trigger: 'blur' }
                ],
                username: [
                    { required: true, message: '用户名不能为空', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '密码不能为空', trigger: 'blur' }
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
                        const currentRowData = this.dbList[param.index];
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
                        const currentRowData = this.dbList[param.index];
                        return h('span',this.dbTypeMap.get(currentRowData.dbType).name);
                    };
                }
                if (item.key === 'operation') {
                    item.render = (h, param) => {
                        const currentRowData = this.dbList[param.index];
                        return h('div', [
                            reviewButton(this, h, currentRowData),
                            editButton(this, h, currentRowData, param.index),
                            deleteButton(this, h, currentRowData, param.index)
                        ]);
                    };
                }
            });
        },
        search (data, argumentObj) {
            let res = data;
            let dataClone = data;
            for (let argu in argumentObj) {
                if (argumentObj[argu].length > 0) {
                    res = dataClone.filter(d => {
                        return d[argu].indexOf(argumentObj[argu]) > -1;
                    });
                    dataClone = res;
                }
            }
            return res;
        },
        handleSearch () {
            this.dbList = this.initDbList;
            this.dbList = this.search(this.dbList, {dbType: this.selectDBType, name: this.searchConnectionName, ip: this.searchIP});
        },
        resetSearch () {
            this.selectDBType = this.searchConnectionName = this.searchIP = '';
            this.dbList = this.initDbList;
            this.reseting = true;
            this.$Loading.start()
            setTimeout(() => {
                this.reseting = false
                this.$Loading.finish()
                this.$http.get('/api/metadata/server/list').then(res =>{
                    const result = res.data;
                    if(result.code === 0){
                        this.dbList = this.initDbList = result.data;
                    }
                })
            }, 2000);
        },
        openAddWindow(name){
            this.formValidate.dbType = name
            this.formValidate.index = -1
            this.formValidate.id = null
            this.formValidate.passwordChanged = false
            this.addingWindow.title = '新增 ' + this.dbTypeMap.get(name).name
            this.handleReset('formValidate')
            this.submitButton.loading = this.submitButton.addable = false
            this.addingWindow.show = true
            this.resetButton = true
        },
        alertSuccess(msg) {
            this.$Notice.success({
                title: msg,
                duration: 3
            });
        },
        handleReset (name) {
            this.$refs[name].resetFields()
            this.submitButton.loading = this.submitButton.addable = false;
        },
        toTestConnection(){
            this.$refs['formValidate'].validate(valid => {
                const newDb = JSON.parse(JSON.stringify(this.formValidate))
                if (valid) {
                    this.testingButton.testing = true
                    this.$Loading.start()
                    setTimeout(() => {
                        this.$http.post('/api/metadata/server/test',newDb).then(res=>{
                            this.testingButton.testing = false
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
                    this.$http.patch('/api/metadata/server/save', newDb).then(res=>{
                        const result = res.data;
                        this.submitButton.loading = false
                        if(result.code === 0){
                            this.initDbList.splice(newDb.index, 1, newDb)
                            this.$Loading.finish()
                            this.addingWindow.show = false
                            this.$Message.success('操作成功！')
                        } else {
                            this.$Message.error(result.msg);
                            this.$Loading.error();
                        }
                    })
                    
                } else {
                    this.$http.post('/api/metadata/server/add',newDb).then(res=>{
                        const result = res.data;
                        this.submitButton.loading = false;
                        if(result.code === 0){
                            this.$Message.success('添加成功！')
                            this.$Loading.finish();
                            this.addingWindow.show = false;
                            this.initDbList.push(result.data)
                        } else {
                            this.$Message.error(result.msg);
                            this.$Loading.error();
                        }
                    })
                }
                this.handleSearch()
            }, 2000);
        }
    },
    mounted () {
        this.$http.get('/api/metadata/dbType').then(res =>{
            const result = res.data;
            if(result.code === 0){
                this.dbTypeList = result.data;
                this.dbTypeList.map(x=> this.dbTypeMap.set(x.id,x));
                this.init();
            }
        })

        this.$http.get('/api/metadata/server/list').then(res =>{
            const result = res.data;
            if(result.code === 0){
                this.dbList = this.initDbList = result.data;
                this.loadingPage = false;
            }
        })

    }
};
</script>
