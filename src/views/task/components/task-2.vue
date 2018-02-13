<template>
    <Row :gutter="10" class="margin-top-10" >
        <Col span="14">
            <Card>
                <Row type="flex" justify="center">
                <Form :label-width="120" class="margin-top-10"
                    ref="value"
                    :model="value" >
                    <FormItem label="执行器">
                        <Select v-model="value.agentId" style="width:250px">
                            <Option v-for="item in agentList" :value="item.id" :key="item.id" :label="item.name"></Option>
                        </Select>
                    </FormItem>
                    <FormItem label="调度模式">
                        <i-switch
                            v-model="value.isScheduled"
                            :true-value="1"
                            :false-value="0"
                            size="large"
                            :disabled="value.hasDownStream === 1">
                            <span slot="open">自动</span>
                            <span slot="close">手动</span>
                        </i-switch>
                        <Tooltip
                            v-if="value.hasDownStream === 1"
                            placement="right" 
                            class="margin-left-10">
                            <div slot="content">
                                <p>无法置为手动？请先通知下游任务移除依赖。</p>
                                <p><a>单击此处</a>查看下游依赖</p>
                            </div>
                            <Button shape="circle" icon="help" type="ghost" size="small"></Button>
                        </Tooltip>
                    <!--
                        <RadioGroup v-model="scheduler.isScheduled" @on-change="inactivate">
                            <Radio value="1" label="自动"></Radio>
                            <Radio value="0" label="手动" :disabled="hasDownStream"></Radio>
                            <Tooltip v-if="hasDownStream" placement="right">
                                <div slot="content">
                                    <p>无法置为手动？请先通知下游任务移除依赖。</p>
                                    <p><a>单击此处</a>查看下游依赖</p>
                                </div>
                                <Button shape="circle" icon="help" type="primary" size="small"></Button>
                            </Tooltip>
                        </RadioGroup>
                    -->
                    </FormItem>
                    <FormItem label="重跑次数">
                        <InputNumber :min="0" :max="10" v-model.number="value.reRun"></InputNumber>
                        <Tooltip placement="right" class="margin-left-10">
                            <div slot="content">
                                <p>当设置为 0 时，出错后不重跑。</p>
                            </div>
                            <Button shape="circle" icon="help" type="ghost" size="small"></Button>
                        </Tooltip>
                    </FormItem>
                    <FormItem label="Cron表达式">
                        <Input 
                            v-model.trim="value.cronExpr"
                            style="width: 210px"
                            icon="ios-clock-outline"
                            :disabled="value.isScheduled === 0">
                        </Input>

                        <Dropdown 
                            trigger="click"
                            placement="bottom"
                            style="margin-left: 10px"
                            >
                            <Button icon="ios-lightbulb-outline"
                                type="ghost"
                                size="small"
                                shape="circle"
                                :disabled="value.isScheduled === 0">
                            </Button>
                            <DropdownMenu slot="list" style="width: 590px">
                                <select size="8" multiple="multiple" style="width:80px;" v-model="cronYear">
                                    <option value="*" selected="selected">每年</option>
                                    <option v-for="i in 50" :value="i + 2017">{{i + 2017}}年</option>
                                </select>
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
                                    <option value="*" selected="selected">每分</option>
                                    <option v-for="i in 60" :value="i - 1">{{i-1}}分</option>
                                </select>
                                <select size="8" multiple="multiple" style="width:80px;" v-model="cronSecond">
                                    <option value="*">每秒</option>
                                    <option v-for="i in 60" :value="i - 1">{{i-1}}秒</option>
                                </select>
                            </DropdownMenu>
                        </Dropdown>

                    </FormItem>
                    <FormItem label="添加依赖">
                        <Input 
                            v-model.trim="keyWord" 
                            icon="ios-search" 
                            placeholder="请输入关键字..." 
                            style="width: 250px"
                            :disabled="value.isScheduled === 0"
                            @on-enter="searching"
                            @on-click="searching">
                        </Input>
                    </FormItem>
                </Form>
                </Row>
                <Table v-if="showTable" size="small" :columns="dependencyColumns" :data="dependencyList" :loading="refreshingDependencis"></Table>
            </Card>
        </Col>
        <Col span="10">
            <Card>
                 <Timeline class="margin-top-10">
                    <TimelineItem v-for="(item,index) in addedDependencies" :color="item.color" :key="item.id">
                        <Icon :type="item.icon" slot="dot" size="24"></Icon>
                        <Dropdown style="float: right;" placement="bottom-end" transfer @on-click="clickDropDown">
                            <Button v-if="item.isTimeDepend" type="text" shape="circle" size="small" icon="android-time"></Button>
                            <Button v-if="item.isLogicDepend" type="text" shape="circle" size="small" icon="network"></Button>
                            <DropdownMenu slot="list">
                                <DropdownItem :disabled="item.isTimeDepend" :selected="item.isTimeDepend" :name="'time-'+index">
                                    <Icon type="android-time"></Icon>&nbsp;&nbsp;时间依赖
                                </DropdownItem>
                                <DropdownItem :disabled="item.isLogicDepend" :selected="item.isLogicDepend" :name="'logic-'+index">
                                    <Icon type="network"></Icon>&nbsp;&nbsp;逻辑依赖
                                </DropdownItem>
                                <DropdownItem divided :name="'delete-'+index">
                                    <Icon type="trash-b"></Icon>&nbsp;&nbsp;删除依赖
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <p class="notwrap timelineitem-title" :title="item.taskName">{{item.taskName}}</p>
                        <p class="timelineitem-content">计划时间 {{item.taskScheduleTime}}</p>
                        <p class="timelineitem-content">开始时间 {{item.taskStartTime}}</p>
                        <p class="timelineitem-content">结束时间 {{item.taskEndTime}}</p>
                    </TimelineItem>
                    <TimelineItem>
                        <Icon type="android-star-outline" slot="dot" size="24"></Icon>
                        <p class="timelineitem-title">{{value.name}}</p>
                    </TimelineItem>
                </Timeline>
            </Card>
        </Col>
    </Row>
</template>


<script>
import expandRow from './table-expand';
const moment = require('moment');

export default {
    name: 'schedule',
    props : {
        value : Object
    },
    components : {
        expandRow
    },
    data () {
        return {
            cronYear: ['*'],
            cronMonth: ['*'],
            cronDay: ['*'],
            cronWeek: ['*'],
            cronHour: ['*'],
            cronMinute: ['*'],
            cronSecond: [],
            showTable: true,
            refreshingDependencis: false,
            keyWord: '',

            addedDependencies: [],
            dependencyColumns : [],
            dependencyList:[],
            agentList : []
        };
    },
    methods : {
        searching(){
            if(this.keyWord === '') return;
            this.refreshingDependencis = true;
            this.$Loading.start()
            this.$http.get('/api/scheduler/search'
                +'?name=' + this.keyWord
                ).then(res=>{
                const result = res.data
                this.refreshingDependencis = false
                if(result.code === 0){
                    this.dependencyList = result.data
                    this.$Loading.finish()
                } else {
                    this.dependencyList = []
                    this.$Loading.error()
                }
            })
        },
        addLogicDepend(depend){
            this.$Loading.start()
            depend.addingLogic = true
            setTimeout(() => {
                depend.addingLogic = false;
                depend.isTimeDepend = false;
                depend.isLogicDepend = true;
                this.$Loading.finish()
                this.modifyDependency(depend)
            }, 1000);
        },
        addTimeDepend(depend){
            this.$Loading.start()
            depend.addingTime = true
            setTimeout(() => {
                depend.addingTime = false;
                depend.isTimeDepend = true;
                depend.isLogicDepend = false;
                this.$Loading.finish()
                this.modifyDependency(depend)
            }, 1000);
        },
        removeDepend(depend){
            this.$Loading.start()
            setTimeout(() => {
                depend.isTimeDepend = depend.isLogicDepend = false;
                this.addedDependencies = this.addedDependencies.filter(x=> x.taskId != depend.taskId)
                this.dependencyList.map(x=>{
                    if(x.taskId === depend.taskId){
                        x.isTimeDepend = x.isLogicDepend = false
                    }
                })
                this.$Loading.finish()
            }, 1000);
        },
        clickDropDown(name){
            const str = name.split('-')
            const dependName = str[0]
            const idx = Number(str[1])
            const depend = this.addedDependencies[idx]
            if(dependName === 'time'){
                this.addTimeDepend(depend)
            }
            if(dependName === 'logic'){
                this.addLogicDepend(depend)
            }
            if(dependName === 'delete'){
                this.removeDepend(depend)
            }
        },
        modifyDependency(depend){
            const now = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')

            if(depend.taskStartTime === null && depend.taskEndTime === null){
                if(depend.taskScheduleTime > now){
                    /* 未开始 */
                    depend.color='#5cadff'

                    depend.icon='play'
                }else{
                    /* 等待 */
                    depend.color='#ff9900'
                    depend.icon='ios-skipforward'
                }
            }
            if(depend.taskStartTime != null && depend.taskEndTime === null){
                /* 运行中 */
                depend.color='#ff9900'
                depend.icon='load-a'
            }
            if(depend.taskStartTime != null && depend.taskEndTime != null && depend.lastRunState === 'success'){
                /* 成功 */
                depend.color='#19be6b'
                depend.icon='android-checkmark-circle'
            }
            if(depend.taskStartTime != null && depend.taskEndTime != null && depend.lastRunState === 'failure'){
                /* 失败 */
                depend.color='#ed3f14'
                depend.icon='close-round'
            }

            let itemExists = false;
            for (var i=0;i<this.addedDependencies.length;i++){
                if(this.addedDependencies[i].taskId === depend.taskId){
                    itemExists = true;
                    this.addedDependencies.splice(i,1,depend)
                    break;
                }
            }
            this.dependencyList.map(x=>{
                if(x.taskId === depend.taskId){
                    x.isTimeDepend = depend.isTimeDepend
                    x.isLogicDepend = depend.isLogicDepend
                }
            })
            if(!itemExists) {
                this.addedDependencies.push(depend)
            }
        }
    },
    watch : {
        cronExpr(cronExpr){
            this.value.cronExpr = cronExpr
        }
    },
    computed : {
        cronExpr () {
            if(this.cronSecond.length === 0) return '';

            let year = this.cronYear
            if(year.length > 1 && year.indexOf("*") === 0){
                year = year.toString().substr(2);
            }
            let month = this.cronMonth
            if(month.length > 1 && month.indexOf("*") === 0){
                month = month.toString().substr(2);
            }
            let day = this.cronDay
            if(day.length > 1 && day.indexOf("*") === 0){
                day = day.toString().substr(2);
            }
            let week = this.cronWeek
            if(!week){week="*";}
            if(week.length > 1 && week.indexOf("*") === 0){
                week = week.toString().substr(2);
            }
            if(week>0){
                week = parseInt(week)+1;
                if(week==8) week=1;
            }

            let hour = this.cronHour
            if(hour.length > 1 && hour.indexOf("*") === 0){
                hour = hour.toString().substr(2);
            }
            let minutes = this.cronMinute
            if(minutes.length > 1 && minutes.indexOf("*") === 0){
                minutes = minutes.toString().substr(2);
            }
            let seconds = this.cronSecond
            if(seconds.length > 1 && seconds.indexOf("*") === 0){
                seconds = seconds.toString().substr(2);
            }

            let cronExp = seconds + " " + minutes + " " + hour + " " ;
            if(week == "*"){
                cronExp += day + " " + month + " ? ";
            }else if(day == "*" && week != "*"){
                cronExp += "? " + month + " " + week + " ";
            }else if(day != "*" && week != "*"){
                this.$Message.error({
                    content: '日期和星期不能同时选择！',
                    duration: 10,
                    closable: true})
                return ''
            }
            cronExp += year;
            return cronExp;
        }
    },
    mounted () {

        this.dependencyColumns = [
            {
                type: 'expand',
                width: 30,
                render: (h, params) => {
                    return h(expandRow, {
                        props: {
                            row: params.row
                        }
                    })
                }
            },
            {
                title: '任务类型',
                key: 'taskType',
                width: 100
            },
            {
                title: '任务名称',
                key: 'taskName'
            },
            {
                key: 'operation',
                title: '操作',
                align: 'center',
                width: 100,
                render: (h, params) => {
                    const depend = params.row;
                    return h('div', [
                        h('Button', {
                            props: {
                                type: depend.isTimeDepend ? 'primary':'dashed',
                                size: 'small',
                                icon: 'android-time',
                                shape: 'circle',
                                loading: depend.addingTime 
                            },
                            on: {
                                click: () => {
                                    if(depend.isTimeDepend) return;
                                    this.addTimeDepend(depend);
                                }
                            }
                        }),
                        h('Button', {
                            props: {
                                type: depend.isLogicDepend ? 'primary':'dashed',
                                size: 'small',
                                icon: 'network',
                                shape: 'circle',
                                loading: depend.addingLogic
                            },
                            class: ['margin-left-10'],
                            on: {
                                click: () => {
                                    if(depend.isLogicDepend) return;
                                    this.addLogicDepend(depend);
                                }
                            }
                        })
                    ]);
                }
            }
        ]

        this.agentList = [{id:1,name:'edwetl-1'},{id:2,name:'edwetl-2'},{id:3,name:'edwetl-3'}]

        this.dependencyList = [
            {
                taskId:1,
                taskType: 'MySQL',
                taskName: 'Running Man',
                taskEndTime: '2017-12-28 18:22:42',
                taskScheduleTime: '2017-12-28 18:00:00',
                taskStartTime: '2017-12-28 18:02:42',
                taskEndTime: null,
                taskOwner: '迪丽热巴',
                addingLogic: false,
                addingTime: false,
                isLogicDepend: false,
                isTimeDepend: false,
                lastRunState: 'success'
            },
            {
                taskId:2,
                taskType: 'Oracle',
                taskName: 'summary_hive_dw_sys_ajk_table_not_use_daily_month',
                taskStartTime: '2017-12-28 18:00:00',
                taskScheduleTime: '2017-12-28 18:00:00',
                taskEndTime: '2017-12-28 18:22:42',
                taskOwner: '迪巴迪丽热巴',
                addingLogic: false,
                addingTime: false,
                isLogicDepend: false,
                isTimeDepend: false,
                lastRunState: 'success'
            },
            {
                taskId:3,
                taskType: 'HBase',
                taskName: 'KafkaSparkStreamingToHBase',
                taskStartTime: null,
                taskScheduleTime: '2017-12-28 18:00:00',
                taskEndTime: null,
                taskOwner: '司马懿',
                addingLogic: false,
                addingTime: false,
                isLogicDepend: false,
                isTimeDepend: false,
                lastRunState: 'failure'
            },
            {
                taskId:4,
                taskType: 'Hive',
                taskName: 'summary_hive_dw_summary_hive_dw_sys_ajk_table_not_use_dailysys_ajk_table_not_use_daily',
                taskStartTime: null,
                taskScheduleTime: '2018-12-28 18:00:00',
                taskEndTime: null,
                taskOwner: '孙悟空',
                addingLogic: false,
                addingTime: false,
                isLogicDepend: false,
                isTimeDepend: false,
                lastRunState: 'failure'
            }
        ]
    }
};
</script>
