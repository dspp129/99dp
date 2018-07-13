<style lang="less">
    
.bounce-enter-active {
  animation: bounce-in .5s;
}
.bounce-leave-active {
  animation: bounce-in .5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

</style>

<template>
    <Row :gutter="10" class="margin-top-10" >
        <Col span="13">
            <Card>
                <Row type="flex" justify="center" align="middle">
                    <Form :label-width="80" class="margin-top-10"
                        ref="value"
                        :model="value" >
                        <FormItem label="执行器">
                            <Select v-model="value.agentId" style="width:230px">
                                <Option v-for="item in agentList" :value="item.id" :key="item.id" :disabled="item.status === 0">{{item.name}}</Option>
                            </Select>
                        </FormItem>
                        <FormItem label="调度模式">
                            <i-switch
                                v-model="value.isScheduled"
                                :true-value="1"
                                :false-value="0"
                                size="large"
                                :disabled="value.hasDownStream > 0">
                                <span slot="open">自动</span>
                                <span slot="close">手动</span>
                            </i-switch>
                            <Tooltip
                                v-if="value.hasDownStream > 0"
                                placement="right" 
                                class="margin-left-10">
                                <div slot="content">
                                    <p>无法置为手动？请先通知下游任务移除依赖。</p>
                                    <p><a>单击此处</a>查看下游依赖</p>
                                </div>
                                <Button shape="circle" icon="help" type="ghost" size="small"></Button>
                            </Tooltip>
                        </FormItem>

                        <transition name="bounce">
                            <FormItem label="Cron表达式" v-show="value.isScheduled > 0">
                                <Input 
                                    v-model.trim="value.cronExpr"
                                    placeholder="点击图标选择周期"
                                    style="width: 230px"
                                    @on-click="selectCron = true"
                                    icon="ios-clock-outline">
                                </Input>
                            </FormItem>
                        </transition>

                        <FormItem label="重跑次数">
                            <InputNumber :min="0" :max="10" v-model.number="value.reRun"></InputNumber>
                            <Tooltip placement="right" class="margin-left-10">
                                <div slot="content">
                                    <p>当设置为 0 时，失败后不重跑。</p>
                                </div>
                                <Button shape="circle" icon="help" type="ghost" size="small"></Button>
                            </Tooltip>
                        </FormItem>
                        <FormItem label="超时时间">
                            <InputNumber :min="0" :max="999" v-model.number="value.timeout"></InputNumber>
                            <span>分钟</span>
                            <Tooltip placement="right" class="margin-left-10">
                                <div slot="content">
                                    <p>允许任务执行的最长时间。</p>
                                    <p>当设置为 0 时，任务无超时时间。</p>
                                </div>
                                <Button shape="circle" icon="help" type="ghost" size="small"></Button>
                            </Tooltip>
                        </FormItem>
                        <FormItem label="失败通知">
                            <RadioGroup v-model="value.timeoutAction">
                                <Radio :label="0">无</Radio>
                                <Radio :label="1">邮件通知</Radio>
                            </RadioGroup>
                        </FormItem>

                        <transition name="bounce">
                            <FormItem label="接警邮箱" prop="alertEmail" v-show="value.timeoutAction > 0">
                                <Input v-model.trim="value.alertEmail"
                                    icon="ios-email-outline" 
                                    placeholder="多邮箱请用逗号分隔" 
                                    style="width: 230px">
                                </Input>
                            </FormItem>
                        </transition>

                        <SelectCron v-model="selectCron"
                            @on-change-cron="onChangeCron">
                        </SelectCron>

                        <FormItem label="添加依赖">
                            <Input v-model.trim="keyWord" 
                                icon="ios-search" 
                                placeholder="请输入关键字..." 
                                style="width: 230px"
                                @on-enter="searching"
                                @on-click="searching">
                            </Input>
                        </FormItem>
                    </Form>
                </Row>
                <Table v-if="showTable" size="small" :columns="dependenceColumns" :data="searchList" :loading="refreshingSearchList"></Table>
            </Card>
        </Col>
        <Col span="11">
            <Card :style="{minHeight}">
                 <Timeline class="margin-top-10">
                    <TimelineItem v-for="(item,index) in addedDependence" :color="renderDependColor(item)" :key="item.parentJobId">
                        <Icon :type="renderDependIcon(item)" slot="dot" size="24"></Icon>
                        <Dropdown style="float: right;" placement="bottom-end" transfer @on-click="clickDropDown">
                            <Button v-if="item.dependOn === 1" type="text" shape="circle" size="small" icon="android-time"></Button>
                            <Button v-if="item.dependOn === 2" type="text" shape="circle" size="small" icon="network"></Button>
                            <DropdownMenu slot="list">
                            <!--
                                <DropdownItem :disabled="item.dependOn === 1" :selected="item.dependOn === 1" :name="'time-'+index">
                                    <Icon type="android-time"></Icon>&nbsp;&nbsp;时间依赖
                                </DropdownItem>
                            -->
                                <DropdownItem :disabled="item.dependOn === 2" :selected="item.dependOn === 2" :name="'logic-'+index">
                                    <Icon type="network"></Icon>&nbsp;&nbsp;逻辑依赖
                                </DropdownItem>
                                <DropdownItem divided :name="'delete-'+index">
                                    <Icon type="trash-b"></Icon>&nbsp;&nbsp;删除依赖
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <p class="notwrap timelineitem-title" :title="item.parentName">{{item.parentName}}</p>
                        <p class="timelineitem-content">计划时间 {{dateFormat(item.nextFireTime)}}</p>
                        <p class="timelineitem-content">开始时间 {{dateFormat(item.startTime)}}</p>
                        <p class="timelineitem-content">结束时间 {{dateFormat(item.endTime)}}</p>
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
import SelectCron from './select-cron'
import expandRow from './table-expand'
import Util from '@/libs/util'


export default {
    name: 'task-2',
    props : {
        value : Object,
        dependenceList: Array
    },
    components : {
        expandRow,SelectCron
    },
    data () {
        return {

            showTable: true,
            refreshingSearchList: false,
            keyWord: '',

            addedDependence: [],
            dependenceColumns : [],
            agentList : [],
            searchList : [],
            taskTypeMap: new Map(),

            selectCron: false
        };
    },
    methods : {
        searching(){

            this.refreshingSearchList = true;
            this.$Loading.start()
            this.getRequest(`/scheduler/searchTop5?keyWord=${this.keyWord}`).then(res => {
                const result = res.data
                this.refreshingSearchList = false
                if(result.code === 0){
                    this.searchList = result.data.content

                    this.searchList.forEach( x => {
                        x.taskTypeName = this.taskTypeMap.get(x.taskType)
                        x.addingTime = false
                        x.addingLogic = false
                        x.dependOn = 0 // need to update real-time
                        this.addedDependence.forEach(d=>{ if(d.parentJobId === x.jobId) x.dependOn = d.dependOn })
                    })
                    this.$Loading.finish()
                } else {
                    this.searchList = []
                    this.$Loading.error()
                }
            })
        },
        dateFormat(timestamp){
            return Util.formatDateTime(timestamp)
        },
        addDepend(scheduler, type){

            if(scheduler.jobId === this.value.jobId){
                this.$Message.error('无法添加当前任务为依赖')
                return
            }
            if(type === 'time'){
                scheduler.addingTime = true
            } else {
                scheduler.addingLogic = true
            }

            this.$Loading.start()
            setTimeout(() => {

                if(type === 'time'){
                    scheduler.addingTime = false
                } else {
                    scheduler.addingLogic = false
                }

                scheduler.dependOn = type === 'time' ? 1:2
                this.$Loading.finish()
                const dependence = this.scheduler2depend(scheduler)
                this.modifyDependency(dependence)
            }, 1000);
        },
        removeDependence(dependence){
            this.$Loading.start()
            setTimeout(() => {
                dependence.dependOn = 0
                this.addedDependence = this.addedDependence.filter(x => x.parentJobId != dependence.parentJobId)

                for (var i=0; i < this.searchList.length; i++){
                    if(this.searchList[i].jobId === dependence.parentJobId){
                        this.searchList[i].dependOn = 0
                        this.searchList.splice(i, 1, this.searchList[i])
                        break;
                    }
                }

                this.$Loading.finish()
            }, 1000);

        },
        clickDropDown(name){
            const str = name.split('-')
            const dependName = str[0]
            const idx = Number(str[1])
            const dependence = this.addedDependence[idx]
            if(dependName === 'time'){
                dependence.dependOn = 1
                this.modifyDependency(dependence)
            }
            if(dependName === 'logic'){
                dependence.dependOn = 2
                this.modifyDependency(dependence)
            }
            if(dependName === 'delete'){
                this.removeDependence(dependence)
            }
        },
        scheduler2depend(scheduler){
            const depend = {
                parentJobId: scheduler.jobId,
                parentName: scheduler.jobName,
                nextFireTime: scheduler.nextFireTime,
                startTime: scheduler.startTime,
                endTime: scheduler.endTime,
                success: scheduler.success,
                dependOn: scheduler.dependOn
            }
            return depend
        },
        renderDependColor(record){
            let color = ''

            if(record.status === -2){
                /* 未开始 */
                color='#5cadff'
            }else if(record.status === -1){
                /* 等待 */
                color='#ff9900'
            }else if(record.status === 0){
                /* 运行中 */
                color='#ff9900'
            }else if(record.success === 1){
                /* 成功 */
                color='#19be6b'
            }else if(record.success === 2){
                /* 强制 */
                color='#ed3f14'
            }else if(record.success === 3){
                /* 失败 */
                color='#ed3f14'
            }

            return color;
        },
        renderDependIcon(record){
            let icon = ''

            if(record.status === -2){
                /* 未开始 */
                icon = 'play'
            }else if(record.status === -1){
                /* 等待 */
                icon = 'ios-skipforward'
            }else if(record.status === 0){
                /* 运行中 */
                icon = 'load-a'
            }else if(record.success === 1){
                /* 成功 */
                icon = 'android-checkmark-circle'
            }else if(record.success === 2){
                /* 强制 */
                icon = 'stop'
            }else if(record.success === 3){
                /* 失败 */
                icon = 'close-round'
            }

            return icon
        },
        modifyDependency(dependence){
            for (var i=0; i < this.searchList.length; i++){
                if(this.searchList[i].jobId === dependence.parentJobId){
                    this.searchList[i].dependOn = dependence.dependOn
                    this.searchList.splice(i, 1, this.searchList[i])
                    break;
                }
            }

            let itemExists = false;
            for (var i=0; i < this.addedDependence.length; i++){
                if(this.addedDependence[i].parentJobId === dependence.parentJobId){
                    itemExists = true;
                    this.addedDependence.splice(i, 1, dependence)
                    break;
                }
            }

            if(!itemExists) {
                this.addedDependence.push(dependence)
            }
        },
        onChangeCron(cron){
            this.value.cronExpr = cron
        }
    },
    watch : {
        dependenceList(value){
            this.addedDependence = value
        },
        addedDependence(value){
            this.$emit('on-change-dependence', value)
        }
    },
    computed : {
        minHeight () {
            return window.innerHeight - 245 + 'px'
        },
    },
    mounted () {

        this.dependenceColumns = [
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
                title: '任务名称',
                key: 'jobName'
            },
            {
                key: 'operation',
                title: '操作',
                align: 'center',
                width: 100,
                render: (h, params) => {
                    const depend = params.row;
                    return h('div', [
                        /*
                        h('Button', {
                            props: {
                                type: depend.dependOn === 1 ? 'primary':'dashed',
                                size: 'small',
                                icon: 'fork-repo',
                                shape: 'circle',
                                loading: depend.addingTime 
                            },
                            on: {
                                click: () => {
                                    if(depend.dependOn === 1) return;
                                    this.addDepend(depend,'time');
                                }
                            }
                        }),
                        */
                        h('Button', {
                            props: {
                                type: depend.dependOn === 2 ? 'primary':'dashed',
                                size: 'small',
                                icon: 'fork-repo',
                                shape: 'circle',
                                loading: depend.addingLogic
                            },
                            // class: ['margin-left-10'],
                            on: {
                                click: () => {
                                    if(depend.dependOn === 2) return;
                                    this.addDepend(depend,'logic');
                                }
                            }
                        })
                    ]);
                }
            }
        ]

        this.getRequest(`/cluster/agent/all`).then(res => {
            const result = res.data
            if(result.code === 0){
                this.agentList = result.data
            }
        })

        if(this.taskTypeMap.size === 0) {
            this.getRequest(`/scheduler/taskType`).then(res => {
                const result = res.data
                if(result.code === 0){
                    result.data.forEach(x => {
                        this.taskTypeMap.set(x.id, x.name)
                    })
                }
            })
        }

    }
};
</script>
