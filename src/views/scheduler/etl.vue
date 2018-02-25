<style lang="less">
    @import '../../styles/common.less';
    @import './etl-dev.less';
</style>

<template>
    <div>
        <Row>
            <Card>
                <Tabs v-model="tabStep" :animated="false">
                    <TabPane label="标签一一" name="step0" style="min-height: 380px">
                        <StepController v-show="showController" v-model="step" :disabled="nextAble0" />
                        <Operation v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <Task1 v-model="dwSchedulerTask"></Task1>
                    </TabPane>
                    <TabPane label="标签二" name="step1" style="min-height: 380px" :disabled="maxStep < 1">
                        <StepController v-show="showController" v-model="step" :disabled="nextAble1" />
                        <Operation v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <ETL1 ref="etl-1" v-model="dwTaskETL"></ETL1>
                    </TabPane>
                    <TabPane label="标签三" name="step2" :disabled="maxStep < 2">
                        <StepController v-show="showController" v-model="step" :disabled="nextAble2" />
                        <Operation v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <ETL2 v-model="dwTaskETL"></ETL2>
                    </TabPane>
                    <TabPane label="标签④④" name="step3" :disabled="maxStep < 3">
                        <StepController v-show="showController" v-model="step" />
                        <Operation v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <ETL3 v-model="dwTaskETL"></ETL3>
                    </TabPane>
                    <TabPane label="标签⑸⑸⑸⑸" name="step4" :disabled="maxStep < 4">
                        <StepController v-show="showController" v-model="step" :disabled="nextAble4" @on-create="onCreate"/>
                        <Operation v-show="!showController" @on-remove="onRemove" @on-save="onSave" />
                        <Task2 v-model="dwSchedulerTask"></Task2>
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
import ETL1 from './components/etl-1'
import ETL2 from './components/etl-2'
import ETL3 from './components/etl-3'
import Task2 from './components/task-2'

export default {
    name: 'scheduler',
    components : {
        StepController,Operation,
        Task1,Task2,
        ETL1,ETL2,ETL3
    },
    data () {
        return {
            showController: true,
            step: {},
            stepList: [],
            tabStep: 'step0',
            maxStep: 0,

            dwSchedulerTask: {
                id:'',
                ownerId: null,
                name: 'This is a test scheduler',
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
                useTmpTable: 0,
                tmpTableName: '',
                preSql: [],
                postSql : []
            },
            
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
            this.$http.delete(`/api/task/etl/${taskId}`).then(res => {
                const result = res.data
                if(result.code === 0){
                    this.$Message.success('删除成功！')
                    this.closePage('task-ETL')
                }
            })
        },
        onSave () {
        },
        onCreate () {
            const dwSchedulerTask = this.dwSchedulerTask
            const dwTaskETL = this.dwTaskETL

            this.$http.post('/api/task/save', {dwSchedulerTask, dwTaskETL}).then(res =>{
                const result = res.data
                if(result.code === 0){
                    this.$Message.success('保存成功！')
                    this.closePage('new-ETL')
                } else {
                    this.$Message.error(result.msg)
                }
            })
        },
    },
    created () {
        const req = this.$route.params
        const taskId = req.id
        if(!isNaN(taskId)){
            this.showController = false
            this.maxStep = 5
            this.$http.get(`/api/task/etl/${taskId}`).then(res => {
                const result = res.data
                if(result.code === 0){
                    this.dwSchedulerTask = result.data.dwSchedulerTask
                    this.dwTaskETL = result.data.dwTaskETL
                }
            })
        }


        this.stepList = [
            {
                title: '新建任务',
                describe: '概述说明'
            },
            {
                title: '源表抽取',
                describe: '标准化或自定义'
            },
            {
                title: '目标表加工',
                describe: '预处理与后处理'
            },
            {
                title: '依赖关系',
                describe: '等待源表处理完成'
            },
            {
                title: '周期调度',
                describe: '配置cron表达式'
            }
        ]

        this.step = {length : this.stepList.length, current : 0}
    },
    mounted () {
    },
    computed : {
        nextAble0 () {
            return !this.dwSchedulerTask.nameIsValid
        },
        nextAble1 () {
            return this.dwTaskETL.sourceTableId === '' || this.dwTaskETL.targetTableId === ''
        },
        nextAble2 () {
            return this.dwTaskETL.targetColumns.length === 0
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
    },
    activated () {
        console.log('activated');
    }
};
</script>
