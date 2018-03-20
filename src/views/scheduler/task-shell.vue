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
                        <StepController v-show="showController" v-model="step" :disabled="nextAble0" />
                        <Operation v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <Task1 v-model="dwSchedulerTask" 
                            :targetDbName="dwTaskShell.targetDbName"
                            :targetTableName="dwTaskShell.targetTableName"
                            :dbTypeList="dbTypeList"
                            :userList="userList"
                            @onChangeTarget="onChangeTarget"></Task1>
                    </TabPane>
                
                    <TabPane label="维护源表" name="step1" style="min-height: 380px" :disabled="maxStep < 1">
                        <StepController v-show="showController" v-model="step" :disabled="nextAble1" />
                        <Operation v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <SQL1 ref="sql-1" v-model="dwTaskShell" :dbTypeList="dbTypeList"></SQL1>
                    </TabPane>

                    <TabPane label="执行Shell" name="step2" style="min-height: 380px" :disabled="maxStep < 2">
                        <StepController v-show="showController" v-model="step"  :disabled="nextAble2" />
                        <Operation v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <Shell2 ref="shell-2" v-model="dwTaskShell"></Shell2>
                    </TabPane>

                    <TabPane label="周期依赖" name="step3" :disabled="maxStep < 3">
                        <StepController v-show="showController" v-model="step" :disabled="nextAble4" @on-create="onCreate"/>
                        <Operation v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <Task2 v-model="dwSchedulerTask"
                            :userList="userList"
                            :dependenceList="dependenceList"
                            @on-change-dependence="onChangeDependence"></Task2>
                    </TabPane>
                    <TabPane label="调度日志" name="step4" v-if="maxStep >= 5">
                        <Operation v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <div>hahhah</div>
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

import StepController from './components/step-controller'
import Operation from './components/operation'
import Task1 from './components/task-1'
import SQL1 from './components/sql-1'
import Shell2 from './components/shell-2'
import Task2 from './components/task-2'

export default {
    name: 'scheduler',
    components : {
        StepController,Operation,
        Task1,Task2,
        SQL1,Shell2
    },
    data () {
        return {
            showController: true,
            step: {},
            stepList: [],
            userList: [],
            dbTypeList: [],
            tabStep: 'step0',
            maxStep: 0,

            

            dwSchedulerTask: {
                id:'',
                ownerId: null,
                name: '',
                nameIsValid: false,
                schedulerDesc: '',
                alertEmail: '',
                agentId: 1,
                isScheduled: 1,
                hasDownStream: 0,
                reRun:0,
                timeout:0,
                timeoutAction:0,
                cronExpr:'',
                dependency: []
            },

            dwTaskShell: {
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
            },
            
            dependenceList: []
        }
    },
    methods: {
        closePage(pageName){
            this.$store.commit('removeTag', pageName)
            this.$store.commit('closePage', pageName)
            this.$router.go(-1)
        },
        onRemove () {
            const taskId = this.dwSchedulerTask.id
            this.$http.delete(`/api/scheduler/${taskId}`).then(res => {
                const result = res.data
                if(result.code === 0){
                    this.$Message.success('删除成功！')
                    this.closePage('task-shell')
                }
            })
        },
        onChangeTarget (target) {
            this.dwTaskShell.targetDbType = target.dbType
            this.dwTaskShell.targetServerId = target.serverId
            this.dwTaskShell.targetDbId = target.dbId
            this.dwTaskShell.targetDbName = target.dbName
            this.dwTaskShell.targetTableId = target.tableId
            this.dwTaskShell.targetTableName = target.tableName
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
            dwTaskShell.sourceTableList.forEach(t => {if(t.id > 0) dwTaskShell.sourceTableIds.push(t.id)})

            this.$http.post('/api/task/shell/save', {dwSchedulerTask, dwTaskShell, dependenceList}).then(res =>{
                const result = res.data
                if(result.code === 0){
                    this.$Message.success('保存成功！')
                    this.$Loading.finish()
                    return true
                } else {
                    this.$Message.error(result.msg)
                    this.$Loading.error()
                    return false
                }
            })
        },
        onCreate () {
            if(this.onSave()) {
                this.closePage('task-shell')
            }
        },
    },
    created () {
        const req = this.$route.params
        const taskId = req.id
        if(taskId > 0){
            this.showController = false
            this.maxStep = 5
            this.$http.get(`/api/task/sql/${taskId}`).then(res => {
                const result = res.data
                if(result.code === 0){
                    this.dwSchedulerTask = result.data.dwSchedulerTask
                    this.dwTaskShell = result.data.dwTaskShell
                    this.dwTaskShell.sourceTableList = result.data.dwMdTableVOList
                    this.dependenceList = result.data.dependenceList
                }
            })
        }

        this.$http.get('/api/task/userList').then(res => {
            const result = res.data
            if(result.code === 0){
                this.userList = result.data
            }
        })

        this.$http.get('/api/metadata/dbType').then(res =>{
            const result = res.data;
            if(result.code === 0){
                this.dbTypeList = result.data;
            }
        })

        this.stepList = [
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
        ]

        this.step = {length : this.stepList.length, current : 0}
    },
    mounted () {
    },
    computed : {
        nextAble0 () {
            return ! (this.dwSchedulerTask.nameIsValid && this.dwTaskShell.targetTableId > 0 )
        },
        nextAble1 () {
            return this.dwTaskShell.sourceTableList.filter(x => x.id > 0).length === 0
        },
        nextAble2 () {
            return this.dwTaskShell.shell.length === 0
        },
        nextAble4 () {
            return this.dwSchedulerTask.isScheduled === 1 && this.dwSchedulerTask.cronExpr.length === 0
        }
    },
    watch: {
        tabStep (tabStep) {
            this.step.current = Number(tabStep.replace('step',''))
        },
        'step.current' (currentStep) {
            this.maxStep = currentStep > this.maxStep ? currentStep : this.maxStep
            this.tabStep = 'step' + currentStep
        }
    }
};
</script>
