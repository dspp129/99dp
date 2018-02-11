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
                        <Task1 v-model="desc"></Task1>
                    </TabPane>
                    <TabPane label="标签二" name="step1" style="min-height: 380px" :disabled="maxStep < 1">
                        <StepController 
                            v-show="showController" 
                            :stepLength="stepList.length" 
                            :currentStep="currentStep" 
                            @on-step-change="changeStep" 
                            :disabled="nextAble2">
                        </StepController>
                        <ETL1 
                            v-model="sourceAndTarget">
                        </ETL1>
                    </TabPane>
                    <TabPane label="标签三" name="step2" :disabled="maxStep < 2">
                        <StepController
                            v-show="showController" 
                            :stepLength="stepList.length"
                            :currentStep="currentStep"
                            @on-step-change="changeStep">
                        </StepController>
                        <ETL2 
                            :sourceTable="sourceAndTarget.sourceTable"
                            :targetTable="sourceAndTarget.targetTable"
                            :sourceColumns="sourceColumns"
                            :targetColumns="targetColumns"
                            @on-source-columns-change="onSourceColumnsChange"
                            @on-target-columns-change="onTargetColumnsChange"></ETL2>
                    </TabPane>
                    <TabPane label="标签④④4" name="step3" :disabled="maxStep < 3">
                        <StepController
                            v-show="showController" 
                            :stepLength="stepList.length"
                            :currentStep="currentStep"
                            @on-step-change="changeStep">
                        </StepController>
                        <ETL3></ETL3>
                    </TabPane>
                    <TabPane label="标签⑸⑸⑸⑸" name="step4" :disabled="maxStep < 4">
                        <StepController
                            v-show="showController" 
                            :stepLength="stepList.length"
                            :currentStep="currentStep"
                            @on-step-change="changeStep"
                            @on-finish="save">
                        </StepController>
                        <Task2></Task2>
                    </TabPane>
                </Tabs>
                <p class="step-form"></p>
                <Steps :current="currentStep">
                    <Step v-for="item in stepList" :title="item.title" :content="item.describe" :key="item.title"></Step>
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

            desc: {
                nameIsValid: false,
                ownerId: null,
                taskName: '',
                taskDesc: 'this is desc',
                alertEmail: ''
            },
            sourceAndTarget : {
                sourceTable: {
                    dbType: '',
                    dbId:'',
                    dbName:'',
                    tableId:'',
                    tableName:''
                },
                targetTable: {
                    dbType: '',
                    dbId:'',
                    dbName:'',
                    tableId:'',
                    tableName:''
                }
            },
            sourceColumns: [],
            targetColumns: []
        };
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
        changeStep(step){
            this.currentStep = step
            this.tabStep = 'step' + step
        },
        onSourceColumnsChange(columns){
            this.sourceColumns = columns
        },
        onTargetColumnsChange(columns){
            this.targetColumns = columns
        },
        save(){
            this.$Message.success('save task')
            this.closePage('etl-dev')
        },
        closePage(pageName){
            this.$store.commit('removeTag', pageName)
            this.$store.commit('closePage', pageName)
            this.$router.go(-1)
        }
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
            return !this.desc.nameIsValid
        },
        nextAble2 () {
            // return false
            return this.sourceAndTarget.sourceTable.tableId === '' || this.sourceAndTarget.targetTable.tableId === ''
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
