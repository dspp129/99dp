<style lang="less">
    @import '../../styles/common.less';
    @import './task-etl.less';
</style>

<template>
    <div>
        <Row>
            <Card :style="{minHeight}">
                <Tabs v-model="tabStep" :animated="false" type="card">
                    <TabPane label="任务说明" name="step0">
                        <StepController v-show="showController" v-model="step" :disabled="!nextAble0" />
                        <Operation :id="dwTask.jobId" v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <Task1 v-model="dwTask" :userList="userList"></Task1>
                    </TabPane>
                    <TabPane label="维护源表" name="step1" :disabled="maxStep < 1">
                        <StepController v-show="showController" v-model="step" :disabled="!nextAble1" />
                        <Operation :id="dwTask.jobId" v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <SQL1 ref="sql-1" v-model="dwTaskShell" :dbTypeList="dbTypeList"></SQL1>
                    </TabPane>
                    <TabPane label="执行Shell" name="step2" :disabled="maxStep < 2">
                        <StepController v-show="showController" v-model="step" :disabled="!nextAble2" />
                        <Operation :id="dwTask.jobId" v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <Shell2 ref="shell-2" v-model="dwTaskShell"></Shell2>
                    </TabPane>
                    <TabPane label="周期依赖" name="step3" :disabled="maxStep < 3">
                        <StepController v-show="showController" v-model="step" :disabled="!nextAble3" @on-create="onCreate"/>
                        <Operation :id="dwTask.jobId" v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <Task2 v-model="dwTask"
                            :userList="userList"
                            :dependenceList="dependenceList"
                            @on-change-dependence="onChangeDependence"></Task2>
                    </TabPane>
                    <TabPane label="调度日志" name="step4" v-if="req.id > 0">
                        <Operation :id="dwTask.jobId" v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <Task3 v-model="dwTask"></Task3>
                    </TabPane>
                </Tabs>
                <p class="step-form" v-show="showController"></p>
                <Steps :current="step.current" v-show="showController">
                    <Step v-for="item in stepList" :title="item.title" :content="item.describe" :key="item.title"></Step>
                </Steps>
            </Card>
        </Row>
    </div>
</template>

<script>

const initTask = {
    jobId:0,
    userId: null,
    jobName: '',
    nameIsValid: false,
    comment: '',
    email: '',
    agentId: 0,
    pause: 0,
    parallelizable: 0,
    hasDownStream: 0,
    runCount:0,
    timeout:0,
    warning: 0,
    cronExpr:''
};

const initTaskShell = {
    id:'',
    sourceTableIds: [],
    sourceTableList: [],
    targetDbType: '',
    targetServerId: '',
    targetDbId: '',
    targetTableId: '',
    targetDbName: '',
    targetTableName: '',
    shell: ''
};

const stepList = [
    {
        title: '新建任务',
        describe: '概述说明'
    },
    {
        title: '维护源表',
        describe: '多表生成单表'
    },
    {
        title: '执行Shell',
        describe: ''
    },
    {
        title: '周期依赖',
        describe: '配置依赖关系'
    }
];

import Util from '@/libs/util'
import StepController from './components/step-controller'
import Operation from './components/operation'
import Task1 from './components/task-1'
import SQL1 from './components/sql-1'
import Shell2 from './components/shell-2'
import Task2 from './components/task-2'
import Task3 from './components/task-3'

export default {
    name: 'task-Shell',
    components : {
        StepController,Operation,
        Task1,Task2,Task3,
        SQL1,Shell2
    },
    data () {
        return {
            pageName : 'task-Shell',
            showController: true,
            req: {id:'new'},
            step: {},
            stepList: [],
            userList: [],
            dbTypeList: [],
            tabStep: 'step0',
            maxStep: 0,
            
            dwTask: {},
            dwTaskShell: {},
            dependenceList: []
        }
    },
    methods: {
        init () {
            this.dwTask = JSON.parse(JSON.stringify(initTask))
            this.dwTaskShell = JSON.parse(JSON.stringify(initTaskShell))
            this.dependenceList = []
            this.dwTask.userId = Util.getUserId()
            this.step.current = 0
            this.maxStep = 0
            this.showController = true
        },
        closePage(){
            this.$store.commit('removeTag', this.pageName)
            this.$store.commit('closePage', this.pageName)
            this.$router.go(-1)
        },
        onRemove () {
            this.$Loading.start()
            const taskId = this.dwTask.jobId
            this.deleteRequest(`/task/${taskId}`).then(res => {
                this.$Loading.finish()
                this.$Message.success('删除成功！')
                this.closePage()
            })
        },
        onChangeDependence (value) {
            this.dependenceList = value
        },
        onSave () {
            this.$Loading.start()
            const dwTask = this.dwTask
            const dwTaskShell = this.dwTaskShell
            const dependenceList = this.dependenceList

            dwTaskShell.sourceTableIds = []
            if(dwTaskShell.sourceTableList){
                dwTaskShell.sourceTableList.forEach(t => {if(t.id > 0) dwTaskShell.sourceTableIds.push(t.id)})
            }

            this.postRequest('/task/shell/save', {dwTask, dwTaskShell, dependenceList}).then(res =>{
                const result = res.data
                if(result.code === 0){
                    this.$Message.success('保存成功！')
                    this.$Loading.finish()
                    this.showController = false
                    if(this.dwTask.jobId === 0){
                        const argu = { id: result.data , tab: this.step.current};
                        this.$router.push({
                            name: this.pageName,
                            params: argu
                        });
                        this.dwTask.jobId = result.data
                    }
                } else {
                    this.$Message.error(result.msg)
                    this.$Loading.error()
                }
            })
        },
        onCreate () {
            this.onSave()
        },
        getTask(taskId){
            if(taskId > 0){
                this.showController = false
                this.maxStep = 99
                this.getRequest(`/task/shell/${taskId}`).then(res => {
                    const result = res.data
                    if(result.code === 0){
                        this.dwTask = result.data.dwTask
                        this.dwTaskShell = result.data.dwTaskShell
                        this.dwTaskShell.sourceTableList = result.data.dwMdTableVOList
                        this.dependenceList = result.data.dependenceList
                    }
                })
            } else {
                this.init()
            }
        }
    },
    created () {
        this.init()
        this.stepList = stepList
        this.step = {length : this.stepList.length, current : 0}

        this.getRequest('/task/userList').then(res => {
            const result = res.data
            if(result.code === 0){
                this.userList = result.data
            }
        })

        this.getRequest('/metadata/dbType').then(res =>{
            const result = res.data;
            if(result.code === 0){
                this.dbTypeList = result.data;
            }
        })
        
    },
    activated () {
        this.req = this.$route.params
    },
    deactivated (){
    },
    mounted () {
    },
    computed : {
        minHeight () {
            return window.innerHeight - 120 + 'px'
        },
        nextAble0 () {
            return this.dwTask.nameIsValid
        },
        nextAble1 () {
            //return this.dwTaskShell.targetTableId > 0
            return true
        },
        nextAble2 () {
            return this.dwTaskShell.shell.length > 0
        },
        nextAble3 () {
            return this.dwTask.agentId > 0 && 
            ( this.dwTask.pause == 1 || this.dwTask.cronExpr.length > 0 ) && 
            ( this.dwTask.warning == 0 || this.dwTask.email.length > 0 )
        }
    },
    watch: {
        tabStep (tabStep) {
            this.step.current = Number(tabStep.replace('step',''))
            //this.$refs['shell-2'].resizeEditor();
        },
        'step.current' (currentStep) {
            this.maxStep = currentStep > this.maxStep ? currentStep : this.maxStep
            this.tabStep = 'step' + currentStep
        },
        'req.id' (id) {
            this.getTask(id)
            const tab = this.req.tab
            if(tab > 0){
                this.step.current = tab
            } else {
                this.step.current = 0
            }
        }
    }
};
</script>
