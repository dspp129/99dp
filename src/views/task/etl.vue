<style lang="less">
    @import '../../styles/common.less';
    @import './etl-dev.less';
</style>

<template>
    <div>
        <Row>
            <Card>
                <Tabs v-model="tabStep" :animated="false">
                    <TabPane label="标签一一一" name="step0" style="min-height: 380px">
                        <StepController 
                            v-show="showController" 
                            :stepLength="stepList.length" 
                            :currentStep="currentStep" 
                            @on-step-change="changeStep" 
                            :disabled="nextAble1">
                        </StepController>
                        <Task1 v-model="schedulerTask"></Task1>
                    </TabPane>
                    <TabPane label="标签二" name="step1" style="min-height: 380px" :disabled="maxStep < 1">
                        <StepController 
                            v-show="showController" 
                            :stepLength="stepList.length" 
                            :currentStep="currentStep" 
                            @on-step-change="changeStep" 
                            :disabled="nextAble2">
                        </StepController>
                        <ETL1 v-model="dwTaskETL"></ETL1>
                    </TabPane>
                    <TabPane label="标签三" name="step2" :disabled="maxStep < 2">
                        <StepController
                            v-show="showController" 
                            :stepLength="stepList.length"
                            :currentStep="currentStep"
                            @on-step-change="changeStep">
                        </StepController>
                        <ETL2 v-model="dwTaskETL"></ETL2>
                    </TabPane>
                    <TabPane label="标签④④4" name="step3" :disabled="maxStep < 3">
                        <StepController
                            v-show="showController" 
                            :stepLength="stepList.length"
                            :currentStep="currentStep"
                            @on-step-change="changeStep">
                        </StepController>
                        <ETL3 v-model="dwTaskETL" @on-sql-change="onSqlChange"></ETL3>
                    </TabPane>
                    <TabPane label="标签⑸⑸⑸⑸" name="step4" :disabled="maxStep < 4">
                        <StepController
                            v-show="showController" 
                            :stepLength="stepList.length"
                            :currentStep="currentStep"
                            @on-step-change="changeStep"
                            @on-save="onSave">
                        </StepController>
                        <Task2 v-model="schedulerTask"></Task2>
                    </TabPane>
                </Tabs>
                <p class="step-form"></p>
                <Steps :current="currentStep">
                    <Step v-for="item in stepList" :title="item.title" :content="item.schedulerTaskribe" :key="item.title"></Step>
                </Steps>
            </Card>
        </Row>
    </div>
</template>

<script>

import StepController from './components/step-controller'
import Task1 from './components/task-1'
import ETL1 from './components/etl-1'
import ETL2 from './components/etl-2'
import ETL3 from './components/etl-3'
import Task2 from './components/task-2'

export default {
    name: 'scheduler',
    components : {
        StepController,
        Task1,Task2,
        ETL1,ETL2,ETL3
    },
    data () {
        return {
            showController: true,
            stepList: [],
            tabStep: 'step0',
            maxStep: 0,
            currentStep: 0,

            schedulerTask: {
                nameIsValid: false,
                ownerId: null,
                name: 'This is a test scheduler',
                schedulerDesc: 'this is desc',
                alertEmail: '',
            
                agentId: 1,
                isScheduled: 1,
                hasDownStream: 0,
                reRun:0,
                cronExpr:'',
                dependency: []
            },

            dwTaskETL: {
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
                preSql: [],
                postSql : []
            },
            
        }
    },
    methods: {
        handleSubmit (name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    this.$Message.success('Success!');
                } else {
                    this.$Message.error('Fail!');
                }
            })
        },
        handleReset (name) {
            this.$refs[name].resetFields();
        },
        changeStep(step) {
            this.currentStep = step
            this.tabStep = 'step' + step
        },
        onSourceColumnsChange(columns) {
            this.sourceColumns = columns
        },
        onTargetColumnsChange(columns) {
            this.targetColumns = columns
        },
        onSqlChange (preSql, postSql) {
            this.dwTaskETL.preSql = preSql
            this.dwTaskETL.postSql = postSql
        },
        closePage(pageName){
            this.$store.commit('removeTag', pageName)
            this.$store.commit('closePage', pageName)
            this.$router.go(-1)
        },
        onSave () {

            const dwSchedulerTask = this.dwSchedulerTask
            const dwTaskETL = this.dwTaskETL

            this.$http.post('/api/task/save', { dwSchedulerTask, dwTaskETL}).then( res =>{
                const result = res.data
                if(result.code === 0){
                    console.log('success');
                    this.targetColumns = result.data.sourceColumns

                    this.$Message.success('save task')
                // this.closePage('etl-dev')
                }
            })


        },
    },
    created () {
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
        ];
    },
    mounted () {

    },
    computed : {
        nextAble1 () {
            return !this.schedulerTask.nameIsValid
        },
        nextAble2 () {
            // return false
            return this.dwTaskETL.sourceTableId === '' || this.dwTaskETL.targetTableId === ''
        }
    },
    watch: {
        tabStep (tabStep) {
            this.currentStep = Number(tabStep.replace('step',''))
        },
        currentStep (currentStep) {
            this.maxStep = currentStep > this.maxStep ? currentStep : this.maxStep
        },
        targetColumns(targetColumns){
            console.log(targetColumns);
        }
    },
    activated () {
        console.log('activated');
    }
};
</script>
