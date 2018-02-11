<template>
    <Row :gutter="10" class="margin-top-10" >
        <Col span="14">
            <Card>
                <Row type="flex" justify="center">
                <Form :label-width="120" class="margin-top-10">
                    <FormItem label="执行器">
                        <Select v-model="scheduler.agent" style="width:250px">
                            <Option value="beijing">New York</Option>
                            <Option value="shanghai">London</Option>
                            <Option value="shenzhen">Sydney</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="调度模式">
                        <RadioGroup v-model="scheduler.mode" @on-change="inactivate">
                            <Radio label="automatic">自动</Radio>
                            <Radio label="manual" :disabled="hasDownStream">手动</Radio>
                            <Tooltip v-if="hasDownStream" placement="right">
                                <div slot="content">
                                    <p>无法置为手动？请先通知下游任务移除依赖。</p>
                                    <p><a>单击此处</a>查看下游依赖</p>
                                </div>
                                <Button shape="circle" icon="help" type="primary" size="small"></Button>
                            </Tooltip>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="重跑次数">
                        <InputNumber :min="0" :max="10" v-model.number="reRun"></InputNumber>
                    </FormItem>
                    <FormItem label="Cron表达式">
                        <Input 
                            style="width: 250px"
                            icon="ios-clock-outline">
                        </Input>
                        <Dropdown trigger="click" placement="bottom-end" style="margin-left: 20px">
                                <Button icon="ios-arrow-down" type="text"></Button>
                            <DropdownMenu slot="list">
                            </DropdownMenu>
                        </Dropdown>
                    </FormItem>
                    <FormItem label="添加依赖">
                        <Input 
                            v-model.trim="searchDependency" 
                            icon="ios-search" 
                            placeholder="Enter something..." 
                            style="width: 250px"
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
                        <p class="timelineitem-title">The Current Job Name</p>
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
    components : {expandRow},
    data () {
        return {
            reRun:0,
            hasDownStream: true,
            showTable:true,
            refreshingDependencis:false,
            title : 'summary_hive_dw_sys_99bill_table_not_use_daily',
            searchDependency:'',
            scheduler :{
                agent: '',
                mode: 'automatic',
                dependency: '',
                isActive: true
            },
            addedDependencies: [],
            dependencyColumns : [],
            dependencyList:[]
        };
    },
    methods : {
        searching(){
            if(this.searchDependency ==='') return;
            this.refreshingDependencis = true;
            this.$Loading.start()
            setTimeout(() => {
                this.refreshingDependencis = false;
                this.$Loading.finish()
            }, 2500);
        },
        inactivate(){
            this.hasDownStream = !this.hasDownStream
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
