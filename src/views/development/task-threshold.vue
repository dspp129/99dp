<style lang="less">
    @import '../../styles/common.less';
    @import './task-etl.less';
</style>

<template>
    <Card :style="{minHeight}">
        <Spin size="large" fix v-if="showSpin"></Spin>
        <Tabs v-model="tabStep" type="card">
            <TabPane label="任务说明" name="step0">
                <StepController v-show="showController" v-model="step" :disabled="!nextAble0" />
                <Operation :id="dwTask.jobId" v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                <Task1 v-model="dwTask" :userList="userList"></Task1>
            </TabPane>
            <TabPane label="执行SQL" name="step1" :disabled="maxStep < 2">
                <StepController v-show="showController" v-model="step" :disabled="!nextAble1" />
                <Operation :id="dwTask.jobId" v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                <Threshold1 ref="threshold-1" v-model="dwTaskThreshold"></Threshold1>
            </TabPane>
            <TabPane label="周期依赖" name="step2" :disabled="maxStep < 3">
                <StepController v-show="showController" v-model="step" :disabled="!nextAble2" @on-create="onCreate"/>
                <Operation :id="dwTask.jobId" v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                <Task2 v-model="dwTask"
                    :userList="userList"
                    :dependenceList="dependenceList"
                    @on-change-dependence="onChangeDependence"></Task2>
            </TabPane>
            <TabPane label="调度日志" name="step3" v-if="dwTask.jobId > 0">
                <Operation :id="dwTask.jobId" v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                <Task3 :id="dwTask.jobId"></Task3>
            </TabPane>
        </Tabs>
    </Card>
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
    pause: 1,
    taskType: 4, // threshold task
    parallelizable: 0,
    hasDownStream: 0,
    runCount:0,
    timeout:0,
    warning: 0,
    cronExpr:''
};

const initTaskThreshold = {
    id:'',
    sqlStatement: '',
    frequency: 0,
    alertType: 1,
    alertMode: 1,
    emailSubject: '',
    emailAddress: '',
    emailContent: ''
};

import Util from '@/libs/util'
import StepController from './components/step-controller'
import Operation from './components/operation'
import Task1 from './components/task-1'
import Threshold1 from './components/threshold-1'
import Task2 from './components/task-2'
import Task3 from './components/task-3'

export default {
    name: 'task-threshold',
    components : {
        StepController,Operation,
        Task1,Task2,Task3,
        Threshold1
    },
    data () {
        return {
            showSpin : false,
            pageName : 'task-threshold',
            showController: true,
            req: {id:'new'},
            step: {length : 3, current : 0},

            userList: [],
            dbTypeList: [],
            tabStep: 'step0',
            maxStep: 0,

            dwTask: { jobId : 0 },
            dwTaskThreshold: {},
            dependenceList: [],
            fullHeight: window.innerHeight
        }
    },
    ready () {
    },
    beforeDestroy () {
        window.removeEventListener('resize', this.handleResize)
    },
    methods: {
        init () {
            this.dwTask = JSON.parse(JSON.stringify(initTask))
            this.dwTaskThreshold = JSON.parse(JSON.stringify(initTaskThreshold))
            this.dependenceList = []
            this.dwTask.userId = Util.getUserId()
            this.step.current = 0
            this.maxStep = 0
            this.showController = true
        },
        handleResize (event) {
            this.fullHeight = document.documentElement.clientHeight
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
            const dwTaskThreshold = this.dwTaskThreshold
            const dependenceList = this.dependenceList

            this.postRequest('/task/threshold/save', {dwTask, dwTaskThreshold, dependenceList}).then(res =>{
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
                this.showSpin = true
                this.showController = false
                this.maxStep = 99
                this.getRequest(`/task/threshold/${taskId}`).then(res => {
                    const result = res.data
                    if(result.code === 0){
                        this.dwTask = result.data.dwTask
                        this.dwTaskThreshold = result.data.dwTaskThreshold
                        this.dependenceList = result.data.dependenceList
                        this.showSpin = false
                    }
                })
            } else {
                this.init()
            }
        }
    },
    created () {
        this.init()

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
        window.addEventListener('resize', this.handleResize)
    },
    computed : {
        minHeight () {
            return this.fullHeight - 120 + 'px'
        },
        nextAble0 () {
            return this.dwTask.nameIsValid
        },
        nextAble1 () {
            return this.dwTaskThreshold.sqlStatement.length > 0 && 
                this.dwTaskThreshold.emailSubject.length > 0 &&
                this.dwTaskThreshold.emailAddress.length > 0
        },
        nextAble2 () {
            return this.dwTask.agentId > 0 && 
            ( this.dwTask.pause == 1 || this.dwTask.cronExpr.length > 0 ) && 
            ( this.dwTask.warning == 0 || this.dwTask.email.length > 0 )
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
