<template>
    <Card>
    <Tabs>
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
                        <FormItem label="创建人" required>
                            <Select v-model="report.lastModifier" style="width:100px">
                                <Option v-for="user in userList" :value="user.username" :label="user.trueName" :key="user.username"></Option>
                            </Select>
                        </FormItem>
                        <FormItem label="日报名称" prop="name" required>
                            <Input style="width: 255px"
                                v-model.trim="report.name"
                                @on-change="onChange"
                                :icon="icon">
                            </Input>
                        </FormItem>
                        <FormItem label="邮箱" required>
                            <Input v-model.trim="report.receiver" icon="person-stalker" placeholder="多邮箱请用封号分隔" style="width: 255px"></Input>
                        </FormItem>
                        <FormItem label="邮件标题" required>
                            <Input v-model.trim="report.subject" icon="ios-email-outline" style="width: 255px"></Input>
                        </FormItem>

                        <FormItem label="跑批频率" prop="crontab" required>
                            <Input style="width: 220px"
                                v-model.trim="report.crontab"
                                icon="ios-clock-outline"
                                :readonly="report.isScheduled === 0">
                            </Input>
                            <Dropdown 
                                trigger="click"
                                placement="bottom"
                                style="margin-left: 10px">
                                <Button icon="ios-lightbulb"
                                    type="primary"
                                    size="small"
                                    shape="circle"
                                    :disabled="report.isScheduled === 0">
                                </Button>
                                <DropdownMenu slot="list" style="width: 420px">
                                    
                                    <select size="8" multiple="multiple" style="width:80px;" v-model="cronMonth">
                                        <option value="*" selected="selected">每月</option>
                                        <option v-for="i in 12" :value="i">{{i}}月</option>
                                    </select>
                                    <select size="8" multiple="multiple" style="width:80px;" v-model="cronDay">
                                        <option value="*" selected="selected">每日</option>
                                        <option v-for="i in 31" :value="i">{{i}}日</option>
                                    </select>
                                    <select size="8" multiple="multiple" style="width:80px;" v-model="cronWeek">
                                        <option value="*" selected="selected">每星期</option>
                                        <option v-for="i in 7" :value="i">星期{{i}}</option>
                                    </select>
                                    <select size="8" multiple="multiple" style="width:80px;" v-model="cronHour">
                                        <option value="*" selected="selected">每时</option>
                                        <option v-for="i in 24" :value="i - 1">{{i-1}}时</option>
                                    </select>
                                    <select size="8" multiple="multiple" style="width:80px;" v-model="cronMinute">
                                        <option value="00">00分</option>
                                        <option value="30">30分</option>
                                    </select>
                                </DropdownMenu>
                            </Dropdown>

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
                        <FormItem label="任务描述">
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
                <Input type="textarea" v-model.trim="report.reportSql" 
                    :autosize="{ minRows: 12}"></Input>
            </Row>
        </TabPane>
        <TabPane label="运行日志" >
            <Row>
                <div style="float: left;">
                    <DateRangePicker @on-date-change="onDateChange"></DateRangePicker>
                </div>

                <div style="float: left;margin-left: 10px;">
                    <Button type="primary" shape="circle" icon="search" @click="onSearch"></Button>
                </div>

                <div style="float: left;margin-left: 10px;">
                    <Pagination 
                        :current="current"
                        :total="total"
                        :size="size"
                        @on-size-change="onSizeChange"
                        @on-current-change="onCurrentChange">
                    </Pagination>
                </div>
                <div style="float: right;">
                    <Button shape="circle" icon="checkmark" type="success"
                        @click="onSave" 
                        style="float: right; margin-right: 10px; margin-left: 15px">
                    </Button>
                    <Button shape="circle" icon="close" type="default" @click="onClose" style="float: right;"></Button>
                </div>
            </Row>
            <Row style="margin-top: 20px;">
                <Table stripe :columns="columnList" :data="logList" size="small"></Table>
            </Row>
        </TabPane>
    </Tabs>
    </Card>
</template>

<script>

import Pagination from '../my-components/pagination'
import DateRangePicker from '../my-components/dateRangePicker'
import moment from 'moment'

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
        width: 150
    },
    {
        key: 'endTime',
        title: '结束时间',
        align: 'center',
        width: 150
    },
    {
        key: 'recordTime',
        title: '记录时间',
        align: 'center',
        width: 150
    }
];


export default {
    name: 'report-auto',
    components: {
        Pagination,DateRangePicker
    },
    data () {

        const validateName = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入任务名称'));
                return
            }

            if(this.report.origName === value) {
                callback();
                return
            }

            this.$http.get(`/api/report/auto/checkName?name=${value}`).then(res => {
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
            if (value.length === 0) {
                callback(new Error('请输入跑批频率'));
            }

            const cron = value.trim().split(' ')
            if(cron.length != 5){
                callback(new Error('跑批频率格式不正确，请重新填写'));
            }

            
        }

        return {
            loadingPage: false,
            icon: '',
            nameIsValid: false,
            startDate: '',
            endDate: '',

            cronMonth: ['*'],
            cronDay: ['*'],
            cronWeek: ['*'],
            cronHour: ['*'],
            cronMinute: [],

            total: 0,
            current: 1,
            size: 10,
            report: {
                isScheduled: 1,
                crontab: ''
            },

            userList: [],
            columnList: [],
            logList: [],

            ruleReportAuto: {
                name: [{ validator: validateName, trigger: 'blur' }],
                crontab: [{ validator: validateCron, trigger: 'change' }]
            }

        };
    },
    methods: {
        init () {
            const req = this.$route.params
            const name = req.name
            if(name === 'new') return;

            this.$http.get(`/api/report/auto/${name}`).then(res => {
                const result = res.data
                if(result.code === 0){
                    this.report = result.data
                    this.report.origName = name
                    this.assembleCron()
                    this.onSearch()
                } else {
                    this.$Message.error(result.msg)
                    this.$router.go(-1);
                }
            })
        },
        assembleCron () {
            this.report.crontab =  this.report.runMinute + ' ' + this.report.runHour  + ' ' + this.report.runDay  + ' ' + this.report.runMonth  + ' ' + this.report.runWeek 
        },
        splitCron () {
            const cron = this.report.crontab.split(' ')
            this.report.runMinute = cron[0]
            this.report.runHour = cron[1]
            this.report.runDay = cron[2]
            this.report.runMonth = cron[3]
            this.report.runWeek = cron[4]
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
        onSave () {
            this.$Loading.start()
            this.splitCron()

            this.$http.put('/api/report/auto/save', this.report).then(res => {
                const result = res.data
                if(result.code===0){
                    this.$Loading.finish()
                    this.$Message.success('保存成功')
                    this.report.origName = this.report.name
                }
            })
        },
        onSizeChange (size) {
            this.size = size
            this.current = 1
            this.onSearch()
        },
        onCurrentChange (current) {
            this.current = current
            this.onSearch()
        },
        onSearch () {
            const name = this.report.origName
            const page = this.current - 1

            this.$Loading.start()

            this.$http.get(`/api/report/auto/log?name=${name}&size=${this.size}&page=${page}&startDate=${this.startDate}&endDate=${this.endDate}`).then(res => {
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
                this.startDate = moment(date[0]).format('YYYY-MM-DD')
                this.endDate = moment(date[1]).format('YYYY-MM-DD')
            }
            this.current = 1
        }
    },
    watch : {
        cronExpr(cronExpr){
            this.report.crontab = cronExpr
        }
    },

    computed : {
        cronExpr () {

            let month = this.cronMonth
            if(month.length > 1 && month.indexOf("*") === 0){
                month = month.toString().substr(2);
            }
            let day = this.cronDay
            if(day.length > 1 && day.indexOf("*") === 0){
                day = day.toString().substr(2);
            }
            let week = this.cronWeek
            if(!week){
                week="*";
            }
            if(week.length > 1 && week.indexOf("*") === 0){
                week = week.toString().substr(2);
            }
            if(week > 0){
                week = parseInt(week) + 1;
                if(week === 8) week = 1;
            }
            let hour = this.cronHour
            if(hour.length > 1 && hour.indexOf("*") === 0){
                hour = hour.toString().substr(2);
            }
            let minutes = this.cronMinute
            if(minutes.length > 1 && minutes.indexOf("*") === 0){
                minutes = minutes.toString().substr(2);
            }

            let cronExp = minutes + " " + hour + " " ;
            if(week == "*"){
                cronExp += day + " " + month + " * ";
            }else if(day == "*" && week != "*"){
                cronExp += "* " + month + " " + week;
            }else if(day != "*" && week != "*"){
                this.$Message.error({
                    content: '日期和星期不能同时选择！',
                    duration: 10,
                    closable: true})
                return '';
            }

            return cronExp;
        }
    },
    mounted () {
        this.columnList = initColumnList
        this.columnList.forEach(item => {
            if (item.key === 'startTime') {
                item.render = (h, param) => {
                    const currentRowData = this.logList[param.index]
                    return h('span', moment(currentRowData.startTime).format('YYYY-MM-DD HH:mm:ss'))
                };
            }
            if (item.key === 'endTime') {
                item.render = (h, param) => {
                    const currentRowData = this.logList[param.index]
                    return h('span', moment(currentRowData.endTime).format('YYYY-MM-DD HH:mm:ss'))
                };
            }
            if (item.key === 'recordTime') {
                item.render = (h, param) => {
                    const currentRowData = this.logList[param.index]
                    return h('span', moment(currentRowData.recordTime).format('YYYY-MM-DD HH:mm:ss'))
                };
            }
        });

        this.init();

    },
    created () {
        this.$http.get('/api/task/userList').then(res => {
            const result = res.data
            if(result.code === 0){
                this.userList = result.data
            }
        })
    }
}
</script>