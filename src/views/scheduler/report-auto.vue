<template>
    <Card :style="{minHeight}">
    <Tabs v-model="tabName">
        <TabPane label="日报详情">
            <Row>
                <Form>
                    <FormItem>
                        <Button shape="circle" icon="checkmark" type="success"
                            @click="onSave" 
                            style="float: right; margin-right: 10px; margin-left: 15px">
                        </Button>
                        <Button shape="circle" icon="close" type="default" @click="onClose" style="float: right;"></Button>
                    </FormItem>
                </Form>
            </Row>
            <Row class="margin-top-20" type="flex" justify="center">
                <Col span="11">
                    <Form label-position="right" :label-width="140"
                        ref="report"
                        :model="report" 
                        :rules="ruleReportAuto">
                        <FormItem label="负责人" prop="lastModifier" required>
                            <Select v-model="report.lastModifier" style="width:100px">
                                <Option v-for="user in userList" :value="user.username" :key="user.username">{{user.trueName}}</Option>
                            </Select>
                        </FormItem>
                        <FormItem label="日报名称" prop="name" required>
                            <Input style="width: 255px"
                                v-model.trim="report.name"
                                @on-change="onChange"
                                :icon="icon">
                            </Input>
                        </FormItem>
                        <FormItem label="邮箱" prop="receiver" required>
                            <Input v-model.trim="report.receiver" icon="person-stalker" placeholder="多邮箱请用封号分隔" style="width: 255px"></Input>
                        </FormItem>
                        <FormItem label="邮件标题" prop="subject" required>
                            <Input v-model.trim="report.subject" icon="ios-email-outline" style="width: 255px"></Input>
                        </FormItem>

                        <FormItem label="跑批频率" prop="crontab" required>
                            <Input style="width: 255px"
                                v-model.trim="report.crontab"
                                icon="ios-clock-outline"
                                :readonly="report.isScheduled == 0">
                            </Input>
                        </FormItem>
                    </Form>
                </Col>
                <Col span="2">
                    <div style="border-right: 1px dashed #ebe9f3; min-height: 300px"></div>
                </Col>
                <Col span="11">
                    <Form label-position="right" :label-width="140">
                        <FormItem label="调度模式">
                            <i-switch
                                v-model="report.isScheduled"
                                :true-value="1"
                                :false-value="0"
                                size="large">
                                <span slot="open">自动</span>
                                <span slot="close">手动</span>
                            </i-switch>
                        </FormItem>
                        <FormItem label="附件格式">
                            <RadioGroup v-model="report.attachmentType" type="button">
                                <Radio label="1">Excel</Radio>
                                <Radio label="2">Zip压缩</Radio>
                            </RadioGroup>
                        </FormItem>
                        <FormItem label="申请人">
                            <Input v-model.trim="report.applicant" style="width: 255px"></Input>
                        </FormItem>

                        <FormItem label="使用部门">
                            <Input v-model.trim="report.mainDept" style="width: 255px"></Input>
                        </FormItem>
                        <FormItem label="日报描述">
                            <Input style="width: 255px;" type="textarea" v-model.trim="report.comment" :autosize="{minRows: 3,maxRows: 5}"></Input>
                        </FormItem>
                    </Form>
                </Col>
            </Row>
        </TabPane>
        <TabPane label="SQL">
            <Row>
                <div>
                    <span>部署服务器</span>
                    <RadioGroup v-model="report.dataSource" type="button">
                        <Radio label="99">VPOS</Radio>
                        <Radio label="103">SEASHELL</Radio>
                    </RadioGroup>
                    
                    <Button shape="circle" icon="checkmark" type="success"
                        @click="onSave" 
                        style="float: right; margin-right: 10px; margin-left: 15px">
                    </Button>
                    <Button shape="circle" icon="close" type="default" @click="onClose" style="float: right;"></Button>
                </div>
            </Row>
            <Row type="flex" justify="center" style="margin-top: 20px;">
                <div style="border-radius:5px;border:1px solid #5cadff;width: 100%;">
                    <editor v-model.trim="report.reportSql" 
                        @init="editorInit" 
                        lang="sql" 
                        theme="tomorrow"
                        width="100%"
                        :height="editorHeight"></editor>
                </div>
            </Row>
        </TabPane>
        <TabPane label="运行日志">
            <Row>
                <DateRangePicker @on-date-change="onDateChange"></DateRangePicker>
                <Button type="primary" shape="circle" icon="search" @click="resetSearch" :loading="loadingTable"></Button>
            </Row>
            <Row class="margin-top-20">
                <TablePagination :total="total" :size="filter.size" @on-page-info-change="changePageInfo">
                     <Table stripe 
                         :columns="columnList" 
                         :data="logList" 
                         size="small"
                        :loading="loadingTable"
                        slot="table">
                    </Table>
                </TablePagination>
            </Row>
        </TabPane>
    </Tabs>
    </Card>
</template>

<script>

import TablePagination from '@/views/my-components/tablePagination';
import DateRangePicker from '../my-components/dateRangePicker';
import Util from '@/libs/util';
import editor from 'vue2-ace-editor';

const initColumnList = [
    {
        key: 'step',
        title: '步骤',
        width: 70
    },
    {
        key: 'flag',
        title: '成功标识',
        width: 100
    },
    {
        key: 'message',
        title: '错误日志',
        ellipsis: true
    },
    {
        key: 'startTime',
        title: '开始时间',
        align: 'center',
        width: 160
    },
    {
        key: 'endTime',
        title: '结束时间',
        align: 'center',
        width: 160
    },
    {
        key: 'recordTime',
        title: '记录时间',
        align: 'center',
        width: 160
    }
];

const initReport = {
    name: '',
    isScheduled: 1,
    crontab: '',
    attachmentType: '1',
    reportSql: '',
    runDay: '',
    runHour: '',
    runMinute: '',
    runMonth: '',
    runWeek: '',
    dataSource: '99'
};

export default {
    name: 'report-auto',
    components: {
        TablePagination,
        DateRangePicker,
        editor
    },
    data () {

        const validateName = (rule, value, callback) => {

            if (value === '') {
                callback(new Error('请输入日报名称'));
                return
            }

            if (value.indexOf('new-') === 0) {
                callback(new Error('名称不合法，请重新输入。'));
                return
            }

            if(this.report.origName === value) {
                callback();
                return
            }

            this.getRequest(`/report/auto/checkName?name=${value}`).then(res => {
                const result = res.data
                if(result.code === 0){
                    this.icon = 'checkmark'
                    this.nameIsValid = true
                    callback();
                } else {
                    this.icon = 'close'
                    this.nameIsValid = false
                    callback(new Error(result.msg))
                }
            })
        }

        const validateCron = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入跑批频率'));
                return
            }

            const cron = value.split(' ')
            if(cron.length != 5){
                callback(new Error('跑批频率格式不正确，请重新填写'));
                return
            }

            callback();
            return
        }

        return {
            tabName: '',
            loadingTable: false,
            icon: '',
            nameIsValid: false,
            startDate: '',
            endDate: '',
            req: {id:'new'},

            total:0,
            filter:{
                page: 1,
                size: 10
            },

            report: {
                reportSql: ''
            },

            userList: [],
            columnList: [],
            logList: [],

            ruleReportAuto: {
                name: [{ validator: validateName, trigger: 'blur' }],
                crontab: [{ validator: validateCron , trigger: 'blur' }],
                subject: [{ required: true, message: '邮件标题 不能为空', trigger: 'blur' }],
                lastModifier: [{ required: true, message: '负责人 不能为空', trigger: 'blur' }],
                receiver: [{ required: true, message: '邮箱 不能为空', trigger: 'blur' }]
            }

        };
    },
    methods: {
        init () {
            this.tabName = '日报详情'
            this.report = JSON.parse(JSON.stringify(initReport))

            this.$refs.report.resetFields()
            this.req = this.$route.params
            const name = this.req.name
            if(name.indexOf('new-') === 0) {
                return;
            }

            this.getRequest(`/report/auto/${name}`).then(res => {
                const result = res.data
                if(result.code === 0){
                    this.report = result.data
                    this.assembleCron()
                    this.report.origName = name
                    this.getData()
                } else {
                    this.$Message.error(result.msg)
                    this.$router.go(-1);
                }
            })
        },
        onChange () {
            this.icon = ''
        },
        onClose () {
            const pageName = 'report-auto'
            this.$store.commit('removeTag', pageName)
            this.$store.commit('closePage', pageName)
            this.$router.go(-1);
        },
        splitCron () {
            const cron = this.report.crontab.split(' ')
            this.report.runMinute = cron[0]
            this.report.runHour = cron[1]
            this.report.runDay = cron[2]
            this.report.runMonth = cron[3]
            this.report.runWeek = cron[4]
        },
        assembleCron () {
            this.report.crontab =  this.report.runMinute + ' ' + this.report.runHour  + ' ' + this.report.runDay  + ' ' + this.report.runMonth  + ' ' + this.report.runWeek 
        },
        onSave () {

            this.$refs.report.validate((valid) => {
                if (valid) {
                    this.$Loading.start()
                    this.splitCron()
                    this.putRequest('/report/auto/save', this.report).then(res => {
                        const result = res.data
                        if(result.code===0){
                            this.$Loading.finish()
                            this.$Message.success('保存成功')
                            this.report.origName = this.report.name
                        } else {
                            this.$Loading.error()
                        }
                    })
                } else {
                    this.$Message.error('请输入正确的内容。');
                }
            })
        },
        changePageInfo(filter) {
            this.filter = filter;
            this.getData()
        },
        resetSearch () {
            this.filter.page = 1
            this.getData()
        },
        getData () {
            const name = this.report.origName

            const page = this.filter.page - 1
            const size = this.filter.size

            this.$Loading.start()

            this.getRequest(`/report/auto/log?name=${name}&size=${size}&page=${page}&startDate=${this.startDate}&endDate=${this.endDate}`).then(res => {
                const result = res.data
                if(result.code===0){
                    this.$Loading.finish()
                    this.logList = result.data.content
                    this.total = result.data.totalElements
                }
            })
        },
        onDateChange (date){
            if(date[0]===''){
                this.startDate = this.endDate = ''
            } else {
                this.startDate = Util.formatDate(date[0])
                this.endDate = Util.formatDate(date[1])
            }
            this.resetSearch()
        },
        editorInit () {
            require('brace/ext/language_tools') //language extension prerequsite...
            require('brace/mode/sql')
            require('brace/theme/tomorrow')
            require('brace/snippets/sql') //snippet
        }
    },
    watch : {
    },
    computed : {
        minHeight () {
            return window.innerHeight - 120 + 'px'
        },
        editorHeight () {
            return window.innerHeight - 260
        }
    },
    mounted () {
        this.columnList = initColumnList
        this.columnList.forEach(item => {
            if (item.key === 'startTime') {
                item.render = (h, param) => {
                    const currentRowData = this.logList[param.index]
                    return h('span', Util.formatDateTime(currentRowData.startTime))
                };
            }
            if (item.key === 'endTime') {
                item.render = (h, param) => {
                    const currentRowData = this.logList[param.index]
                    return h('span', Util.formatDateTime(currentRowData.endTime))
                };
            }
            if (item.key === 'recordTime') {
                item.render = (h, param) => {
                    const currentRowData = this.logList[param.index]
                    return h('span', Util.formatDateTime(currentRowData.recordTime))
                };
            }
        });
    },
    activated () {
        this.req = this.$route.params
    },
    created () {
        this.getRequest('/task/userList').then(res => {
            const result = res.data
            if(result.code === 0){
                this.userList = result.data
            }
        })
    },
    watch : {
        req(req){
            this.init()
        }
    }
}
</script>