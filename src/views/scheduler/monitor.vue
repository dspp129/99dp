<style lang="less">
    @import '../../styles/common.less';
    @import './monitor.less';
</style>

<template>
    <div>
        <Row :gutter="10">
            <Col span="24">
                <Card>
                    <p slot="title">
                        <Icon type="qr-scanner"></Icon>
                        调度详情
                    </p>
                    <Row :gutter="10">
                        <Col span="12" class="image-editor-con2">
                            <p><b>任务名称</b><a @click="openTask" :title="record.jobName">{{record.jobName}}</a></p>
                            <p><b>任务类型</b>{{record.taskTypeName}}</p>
                            <p><b>执 行 器</b>{{record.agentName}}

                                <Poptip placement="right" width="180">
                                    <Button type="text" shape="circle" icon="search" size="small" :loading="loadingAgentInfo" @click="showAgentInfo"></Button>
                                    <div slot="content">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th align="left" width="100">IP</th>
                                                    <th align="left">Port</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>{{agentInfo.ip}}</td>
                                                    <td>{{agentInfo.port}}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </Poptip>
                            </p>
                            <p><b>执行方式</b>
                                <Tag v-show="record.execType === 0" color="green">自 动</Tag>
                                <Tag v-show="record.execType === 1" color="blue">手 动</Tag>
                                <Tag v-show="record.execType === 2" color="yellow">重 跑</Tag>
                                <Tag v-show="record.execType === 3" color="default">现 场</Tag>
                            </p>

                            <p><b>执行状态</b>
                                <Tag v-show="record.success === 0" color="red">失 败</Tag>
                                <Tag v-show="record.success === 1" color="green">成 功</Tag>
                                <Tag v-show="record.success === 2" color="red">强 制</Tag>
                                <Tag v-show="record.success === 3" color="#80848f">超 时</Tag>
                                <Tag v-show="record.success === -1" color="default">未调度</Tag>
                            </p>

                        </Col>

                        <Col span="12" class="image-editor-con2">
                            <p><b>负 责 人</b>{{record.userName}}</p>
                            <p><b>计划时间</b>{{record.fireTime}}</p>
                            <p><b>开始时间</b>{{record.startTime}}</p>
                            <p><b>结束时间</b>{{record.endTime}}</p>
                            <p><b>运行时长</b>{{record.durationTime}}</p>
                        </Col>
                    </Row>

                    <Row>
                        <Col span="24" class="image-editor-con2">
                            <p><b>执行命令</b>{{record.command}}</p>
                        </Col>
                    </Row>

                </Card>
            </Col>
        </Row>
        <Row>
            <Col class="margin-top-10">
                <Card>
                    <Tabs>
                        <TabPane label="日志详情" icon="ios-film-outline">
                            <pre style="white-space: pre-wrap;word-wrap: break-word;font-family:couriernew, courier;font-size:8px;">{{record.message}}</pre>
                        </TabPane>
                        <TabPane label="依赖详情" icon="usb">
                            <!-- 上游依赖  -->


        <Row>
            <ButtonGroup shape="circle" style="float: right;">
                <Button type="primary" icon="ios-skipbackward"></Button>

                <Button type="primary">
                    <Icon type="chevron-left"></Icon>
                </Button>
                <Button type="primary">
                    <Icon type="chevron-right"></Icon>
                </Button>
                <Button type="primary" icon="ios-skipforward"></Button>

            </ButtonGroup>
        </Row>

                            <Row class="margin-top-10">
                                <SchedulerCard stream="up" :recordList="upStreamList"></SchedulerCard>
                            </Row>

                            <Row type="flex" justify="center" align="middle" style="height: 70px">
                                <a>
                                    <Icon type="arrow-down-a" size="50" class="flex-arrow"></Icon>
                                </a>
                            </Row>

                            <!-- 此调度  -->
                            <Row class="dependency-parent-bar">

                                <Card class="dependency-child-bar">
                                    <p slot="title">
                                        <Icon style="float: left;margin-left: 5px;" type="android-checkmark-circle" size="22" color="#ff9900"></Icon>
                                        <span style="float: left;margin-left: 10px;" >
                                            Classic film
                                        </span>
                                    </p>
                                    asdfadskaljsjfasdf
                                </Card>

                            </Row>

                            <Row type="flex" justify="center" align="middle" style="height: 70px">
                                <a >
                                    <Icon type="arrow-down-a" size="50" class="flex-arrow"></Icon>
                                </a>
                            </Row>

                            <Row>
                                <SchedulerCard stream="down" :recordList="downStreamList"></SchedulerCard>
                            </Row>

                        </TabPane>
                    </Tabs>
                </Card>
            </Col>
        </Row>
    </div>
</template>

<script>


const reviewButton = (vm, h, currentRowData) =>{
    return h('Button', {
        props: {
            type: 'info',
            size: 'small',
            icon: 'search',
            shape: 'circle'
        },
        style: {
            marginRight: '10px'
        },
        on: {
            click: () => {
                const argu = { id: currentRowData.recordId };
                vm.$router.push({
                    name: 'monitor',
                    params: argu
                });
            }
        }
    })
};

const playButton = (vm, h, currentRowData, index) =>{
    return h('Button', {
        props: {
            type: 'ghost',
            size: 'small',
            icon: 'play',
            shape: 'circle',
        },
        style: {
            marginRight: '10px'
        },
        on: {
            click: () => {
                
            }
        }
    })
};

import moment from 'moment'
import SchedulerCard from './components/scheduler-card'

export default {
    name: 'monitor',
    components: {
        SchedulerCard
    },
    data () {
        return {
            record:{},
            loadingAgentInfo: false,
            agentInfo:{},

            upStreamList: [
                {recordId:1,jobName:'up-task1'},
                {recordId:2,jobName:'up-task2'},
                {recordId:3,jobName:'up-task3'}
            ],
            downStreamList: [
                {recordId:31,jobName:'down-task1'},
                {recordId:41,jobName:'down-task2'},
                {recordId:21,jobName:'down-task3'},
                {recordId:51,jobName:'down-task4'}
            ]
        };
    },
    methods: {
        timeDiff(startTime, endTime){
            const start = moment(startTime)
            const end = endTime === null ? new Date() : moment(endTime)
            const du = moment.duration(end - start, 'ms')

            const days = du.get('days')
            const hours = du.get('hours')
            const minutes = du.get('minutes')
            const seconds = du.get('seconds')

            let txt = seconds+"秒"
            if(minutes > 0) txt =  minutes+"分"+ txt;
            if(hours > 0) txt =  hours+"小时"+ txt;
            if(days > 0) txt =  days+"天"+ txt;

            return txt;
        },
        openTask (){
            const argu = { id: this.record.jobId };
            this.$router.push({
                name: 'task-' + this.record.taskTypeName,
                params: argu
            });

        },
        showAgentInfo(){
            if(JSON.stringify(this.agentInfo)!=="{}"){
                return
            }
            this.loadingAgentInfo = true
            this.$http.get(`/api/monitor/agent/${this.record.agentId}`).then(res => {
                const result = res.data
                if(result.code === 0){
                    this.agentInfo = result.data
                    this.loadingAgentInfo = false
                }
            })
        },
        formatDateTime(time){
            return moment(time).format('YYYY-MM-DD HH:mm:ss')
        }
    },
    mounted () {

    },
    created () {

        const req = this.$route.params
        const recordId = req.id

        this.$http.get(`/api/monitor/record/${recordId}`).then(res => {
            const result = res.data
            if(result.code === 0){
                this.record = result.data
                this.record.durationTime = this.timeDiff(this.record.startTime, this.record.endTime)
                this.record.fireTime = this.formatDateTime(this.record.fireTime)
                this.record.startTime = this.formatDateTime(this.record.startTime)
                this.record.endTime = this.formatDateTime(this.record.endTime)
            }
        })
    }
}


</script>