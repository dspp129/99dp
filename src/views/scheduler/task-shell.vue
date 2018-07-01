<style lang="less">
    @import '../../styles/common.less';
    @import './task-etl.less';
</style>

<template>
    <div>
        <Row>
            <Card>
                <Tabs v-model="tabStep" :animated="false" type="card">
                    <TabPane label="任务说明" name="step0" style="min-height: 380px">
                        <StepController v-show="showController" v-model="step" :disabled="!nextAble0" />
                        <Operation v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <Task1 v-model="dwSchedulerTask" :userList="userList"></Task1>
                    </TabPane>
                
                    <TabPane label="维护源表" name="step1" style="min-height: 380px" :disabled="maxStep < 1">
                        <StepController v-show="showController" v-model="step" :disabled="!nextAble1" />
                        <Operation v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <SQL1 ref="sql-1" v-model="dwTaskShell" :dbTypeList="dbTypeList"></SQL1>
                    </TabPane>

                    <TabPane label="执行Shell" name="step2" style="min-height: 380px" :disabled="maxStep < 2">
                        <StepController v-show="showController" v-model="step" :disabled="!nextAble2" />
                        <Operation v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <Shell2 ref="shell-2" v-model="dwTaskShell"></Shell2>
                    </TabPane>

                    <TabPane label="周期依赖" name="step3" :disabled="maxStep < 3">
                        <StepController v-show="showController" v-model="step" :disabled="!nextAble3" @on-create="onCreate"/>
                        <Operation v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <Task2 v-model="dwSchedulerTask"
                            :userList="userList"
                            :dependenceList="dependenceList"
                            @on-change-dependence="onChangeDependence"></Task2>
                    </TabPane>
                    <TabPane label="调度日志" name="step4" v-if="req.id > 0">
                        <Operation v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <Task3 v-model="dwSchedulerTask"></Task3>
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
    id:0,
    ownerId: null,
    name: '',
    nameIsValid: false,
    schedulerDesc: '',
    alertEmail: '',
    agentId: 0,
    isScheduled: 0,
    hasDownStream: 0,
    reRun:0,
    timeout:0,
    timeoutAction:'0',
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
            showController: true,
            req: {id:'new'},
            step: {},
            stepList: [],
            userList: [],
            dbTypeList: [],
            tabStep: 'step0',
            maxStep: 0,
            
            dwSchedulerTask: {},
            dwTaskShell: {},
            dependenceList: []
        }
    },
    methods: {
        init () {
            this.dwSchedulerTask = JSON.parse(JSON.stringify(initTask))
            this.dwTaskShell = JSON.parse(JSON.stringify(initTaskShell))
            this.dependenceList = []
            this.dwSchedulerTask.ownerId = Util.getUserId()
            this.step.current = 0
        },
        closePage(pageName){
            this.$store.commit('removeTag', pageName)
            this.$store.commit('closePage', pageName)
            this.$router.go(-1)
        },
        onRemove () {
            this.$Loading.start()
            const taskId = this.dwSchedulerTask.id
            this.deleteRequest(`/scheduler/task/${taskId}`).then(res => {
                this.$Loading.finish()
                this.$Message.success('删除成功！')
                this.closePage('task-Shell')
            })
        },
        onChangeDependence (value) {
            this.dependenceList = value
        },
        onSave () {
            this.$Loading.start()
            const dwSchedulerTask = this.dwSchedulerTask
            const dwTaskShell = this.dwTaskShell
            const dependenceList = this.dependenceList

            dwTaskShell.sourceTableIds = []
            if(dwTaskShell.sourceTableList){
                dwTaskShell.sourceTableList.forEach(t => {if(t.id > 0) dwTaskShell.sourceTableIds.push(t.id)})
            }

            this.postRequest('/task/shell/save', {dwSchedulerTask, dwTaskShell, dependenceList}).then(res =>{
                const result = res.data
                if(result.code === 0){
                    this.$Message.success('保存成功！')
                    this.$Loading.finish()

                    if(!this.dwSchedulerTask.id > 0){
                        this.getTask(result.data)
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
                        this.dwSchedulerTask = result.data.dwSchedulerTask
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
        nextAble0 () {
            return this.dwSchedulerTask.nameIsValid
        },
        nextAble1 () {
            //return this.dwTaskShell.targetTableId > 0
            return true
        },
        nextAble2 () {
            return this.dwTaskShell.shell.length > 0
        },
        nextAble3 () {
            return this.dwSchedulerTask.agentId > 0 && 
            ( this.dwSchedulerTask.isScheduled == 0 || this.dwSchedulerTask.cronExpr.length > 0 ) && 
            ( this.dwSchedulerTask.timeoutAction == 0 || this.dwSchedulerTask.alertEmail.length > 0 )
        }
    },
    watch: {
        tabStep (tabStep) {
            this.step.current = Number(tabStep.replace('step',''))
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
