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
                            :targetDbName="dwTaskETL.targetDbName"
                            :targetTableName="dwTaskETL.targetTableName"
                            :dbTypeList="dbTypeList"
                            :userList="userList"
                            @onChangeTarget="onChangeTarget"></Task1>
                    </TabPane>
                <!--
                    <TabPane label="标签二" name="step1" style="min-height: 380px" :disabled="maxStep < 1">
                        <StepController v-show="showController" v-model="step" :disabled="nextAble1" />
                        <Operation v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <ETL1 ref="etl-1" v-model="dwTaskETL"></ETL1>
                    </TabPane>
                -->
                    <TabPane label="ETL抽取" name="step1" :disabled="maxStep < 1">
                        <StepController v-show="showController" v-model="step" :disabled="nextAble2" />
                        <Operation v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <ETL2 v-model="dwTaskETL"
                            :dbTypeList="dbTypeList"></ETL2>
                    </TabPane>
                    <TabPane label="数据加工" name="step2" :disabled="maxStep < 2">
                        <StepController v-show="showController" v-model="step" />
                        <Operation v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <ETL3 v-model="dwTaskETL"></ETL3>
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

import Cookies from 'js-cookie'
import StepController from './components/step-controller'
import Operation from './components/operation'
import Task1 from './components/task-1'
import ETL1 from './components/etl-1'
import ETL2 from './components/etl-2'
import ETL3 from './components/etl-3'
import Task2 from './components/task-2'
import Task3 from './components/task-3'

export default {
    name: 'scheduler',
    components : {
        StepController,Operation,
        Task1,Task2,Task3,
        ETL1,ETL2,ETL3
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

            dwTaskETL: {
                id:'',
                sourceDbType: '',
                sourceServerId: '',
                sourceDbId: '',
                sourceTableId: '',
                sourceDbName: '',
                sourceTableName: '',
                sourceColumns: [],
                sourcePartitionColumns: [],
                whereSql: '',
                useSql: 0,
                querySql: '',

                targetDbType: '',
                targetServerId: '',
                targetDbId: '',
                targetTableId: '',
                targetDbName: '',
                targetTableName: '',
                targetColumns: [],
                targetPartitionColumns: [],
                useTmpTable: 0,
                tmpTableName: '',
                preSql: [],
                postSql : []
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
            this.$Loading.start()
            const taskId = this.dwSchedulerTask.id
            this.deleteRequest(`/scheduler/${taskId}`).then(res => {
                this.$Loading.finish()
                this.$Message.success('删除成功！')
                this.closePage('task-ETL')
            })
        },
        onChangeTarget (target) {
            this.dwTaskETL.targetDbType = target.dbType
            this.dwTaskETL.targetServerId = target.serverId
            this.dwTaskETL.targetDbId = target.dbId
            this.dwTaskETL.targetDbName = target.dbName
            this.dwTaskETL.targetTableId = target.tableId
            this.dwTaskETL.targetTableName = target.tableName
        },
        onChangeDependence (value) {
            this.dependenceList = value
        },
        onSave () {
            this.$Loading.start()
            const dwSchedulerTask = this.dwSchedulerTask
            const dwTaskETL = this.dwTaskETL
            const dependenceList = this.dependenceList

            this.postRequest('/task/etl/save', {dwSchedulerTask, dwTaskETL, dependenceList}).then(res =>{
                const result = res.data
                if(result.code === 0){
                    this.$Message.success('保存成功！')
                    this.$Loading.finish()
                    // 如果是新任务则跳转
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
                this.maxStep = 5
                this.getRequest(`/task/etl/${taskId}`).then(res => {
                    const result = res.data
                    if(result.code === 0){
                        this.dwSchedulerTask = result.data.dwSchedulerTask
                        this.dwTaskETL = result.data.dwTaskETL
                        this.dependenceList = result.data.dependenceList
                    }
                })
            } else {
                this.dwSchedulerTask.ownerId = Number(Cookies.get('userId'))
                this.dwSchedulerTask.alertEmail = Cookies.get('user') + '@99Bill.com'
            }
        }
    },
    created () {
        const req = this.$route.params
        const taskId = req.id
        this.getTask(taskId)

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

        this.stepList = [
            {
                title: '新建任务',
                describe: '概述说明'
            },
            {
                title: 'ETL抽取',
                describe: '标准化或自定义'
            },
            {
                title: '数据加工',
                describe: '预处理与后处理'
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
            return ! (this.dwSchedulerTask.nameIsValid && this.dwTaskETL.targetTableId > 0 )
        },
        nextAble1 () {
            return false;
            //return this.dwTaskETL.sourceTableId === '' || this.dwTaskETL.targetTableId === ''
        },
        nextAble2 () {
            return ! (this.dwTaskETL.targetColumns.length > 0 && this.dwTaskETL.sourceTableId > 0 )
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
