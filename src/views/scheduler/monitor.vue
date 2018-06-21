<style lang="less">
    @import '../../styles/common.less';
    @import './monitor.less';
</style>

<template>
    <div>
        <Row :gutter="10">
            <Col span="24">
                <Card icon="qr-scanner" title="调度详情">
                    <a type="text" slot="extra" @click.prevent="refreshRecord">
                        <Icon type="ios-loop-strong"></Icon>&nbsp;&nbsp;刷 新
                    </a>
                    
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
                                                    <td>{{agentInfo.host}}</td>
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
                                <Tag v-show="record.execType === 2" color="yellow">手 动</Tag>
                                <Tag v-show="record.execType === 3" color="default">重 跑</Tag>
                                <Tag v-show="record.execType === 4" color="default">现 场</Tag>
                                <Tag v-show="record.execType === 5" color="default">强 制</Tag>
                            </p>

                            <p><b>执行结果</b>
                                <template v-if="record.status === -1">
                                    <Tag color="blue">等 待</Tag>
                                </template>
                                <template v-else-if="record.status === 0">
                                    <Tag color="yellow">执 行</Tag>
                                </template>
                                <template v-else>
                                    <Tag v-show="record.success === 0" color="red">失 败</Tag>
                                    <Tag v-show="record.success === 1" color="green">成 功</Tag>
                                    <Tag v-show="record.success === 2" color="red">强 制</Tag>
                                    <Tag v-show="record.success === 3" color="#80848f">超 时</Tag>
                                    <Tag v-show="record.success === -1" color="default">未调度</Tag>
                                </template>
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
                    <Tabs @on-click="clickTag">
                        <TabPane label="日志详情" name="detail" icon="ios-film-outline">
                            <pre style="white-space: pre-wrap;word-wrap: break-word;font-family:couriernew, courier;font-size:8px;">{{record.message}}</pre>
                        </TabPane>
                        <TabPane label="依赖详情" name="depend" icon="usb">
                            <!-- 上游依赖  -->

                            <Row>
                                <ButtonGroup shape="circle" style="float: right;">
                                    <Button type="primary" icon="chevron-left"></Button>
                                    <Button type="primary" @click="resetDependence" >
                                        <Icon type="refresh"></Icon>
                                    </Button>
                                    <Button type="primary" icon="chevron-right"></Button>
                                </ButtonGroup>
                            </Row>

                            <template v-if="upStreamList.length > 0">
                                <Row type="flex" justify="center" align="middle" >
                                    <div :style="{width: upStreamList.length * 320 + 'px'}">
                                        <RecordCardLine stream="up" :recordList="upStreamList" @on-change="lookupDependency"></RecordCardLine>
                                    </div>
                                </Row>

                                <Row type="flex" justify="center" align="middle" style="height: 70px">
                                    <a>
                                        <Icon type="arrow-down-a" size="50" class="flex-arrow"></Icon>
                                    </a>
                                </Row>
                            </template>

                            <!-- 此调度  -->
                            <Row type="flex" justify="center" align="middle" >
                                <div :style="{width: selfList.length * 320 + 'px'}">
                                    <RecordCardLine :recordList="selfList"></RecordCardLine>
                                </div>
                                <!--
                                <RecordCard :scheduler="selfList[0]"></RecordCard>
                                -->
                            </Row>

                            <!--
                            <Row class="dependency-parent-bar">
                                <Card class="dependency-child-bar">
                                    <p slot="title">
                                        <Icon style="float: left;margin-left: 5px;" type="android-checkmark-circle" size="22" color="#ff9900"></Icon>
                                        <span style="float: left;margin-left: 10px;" >
                                            Classic film
                                        </span>
                                    </p>
                                </Card>

                            </Row>
                            -->
                            <template v-if="downStreamList.length > 0">
                                <Row type="flex" justify="center" align="middle" style="height: 70px">
                                    <a >
                                        <Icon type="arrow-down-a" size="50" class="flex-arrow"></Icon>
                                    </a>
                                </Row>

                                <Row type="flex" justify="center" align="middle" >
                                    <div :style="{width: downStreamList.length * 320 + 'px'}">
                                        <RecordCardLine stream="down" :recordList="downStreamList" @on-change="lookupDependency"></RecordCardLine>
                                    </div>
                                </Row>
                            </template>
                        </TabPane>
                    </Tabs>
                </Card>
            </Col>
        </Row>
    </div>
</template>

<script>

import RecordCardLine from './components/record-card-line';
import Util from '@/libs/util';

export default {
    name: 'monitor',
    components: {
        RecordCardLine
    },
    data () {
        return {
            readingLog: false,
            countSecond: Object,
            wslog: Object,
            elapsedSec: 0,
            record:{
                message:''
            },
            loadingAgentInfo: false,
            agentInfo:{},

            upStreamList: [],
            selfList: [],
            downStreamList: [],
            websock: null
        };
    },
    methods: {
        init () {
            const req = this.$route.params
            const recordId = req.id

            this.getRequest(`/monitor/record/${recordId}`).then(res => {
                const result = res.data
                if(result.code === 0){
                    this.record = result.data
                    this.record.durationTime = Util.timeDiff(this.record.startTime, this.record.endTime)
                    this.record.fireTime = Util.formatDateTime(this.record.fireTime)
                    this.record.startTime = Util.formatDateTime(this.record.startTime)
                    this.record.endTime = Util.formatDateTime(this.record.endTime)
                    
                    if(this.record.status !== 1){
                        this.printLogByWebSocket()
                    }
                }
            })

            this.resetDependence()
        },
        openTask () {
            const argu = { id: this.record.schedulerId };
            this.$router.push({
                name: 'task-' + this.record.taskTypeName,
                params: argu
            });
        },
        showAgentInfo () {
            if(JSON.stringify(this.agentInfo)!=="{}"){
                return
            }
            this.loadingAgentInfo = true
            this.getRequest(`/monitor/agent/${this.record.agentId}`).then(res => {
                const result = res.data
                if(result.code === 0){
                    this.agentInfo = result.data
                    this.loadingAgentInfo = false
                }
            })
        },
        resetDependence(){
            const req = this.$route.params
            const recordId = req.id
            this.lookupDependency(recordId)
        },
        clickTag (tagName) {
            /*
            if(tagName === 'depend'){
                const req = this.$route.params
                const recordId = req.id
                this.lookupDependency(recordId)
            }
            */
        },
        lookupDependency(recordId){
            this.getRequest(`/monitor/record/${recordId}/dependence`).then(res => {
                const result = res.data
                if(result.code === 0){
                    this.upStreamList = result.data.up
                    this.downStreamList = result.data.down
                    this.selfList =  result.data.self
                }
            })
        },
        refreshRecord(){
            this.closeWebSocket()
            this.init()
        },
        printLogByWebSocket() {
            this.record.message = ''
            this.elapsedSec = 1
            this.readingLog = true
            this.countSecond = window.setInterval(() => { this.elapsedSec += 1 }, 1000)
            this.wslog = new WebSocket(`ws://${window.location.host}/api/webSocket/${this.record.pid}`);

            /*  客户端接受服务器端数据时触发
            wslog.onopen = (evnet) => {
                console.log('发送数据')
                wslog.send('发送数据')
            }
            */
            
            // 接收服务端的实时日志并添加到HTML页面中
            this.wslog.onmessage = (event) => {
                this.record.message += event.data
            };
            
            // 连接关闭时触发
            this.wslog.onclose = (event) => {
                this.readingLog = false
                console.log('webSocket closes after ' + this.elapsedSec  + ' seconds');
            }
        },
        closeWebSocket(){
            if(this.wslog !== Object){
                this.wslog.close()
            }
        }
    },
    mounted () {
    },
    activated () {
        this.init()
    },
    created () {
    },
    deactivated (){
        this.closeWebSocket()
    },
    watch: {
        elapsedSec (second) {
            // 每隔30秒发送心跳，防止Nginx 60秒无通讯自动断开
            if(second % 30 === 0){
                this.wslog.send('发送心跳')
            }
        },
        readingLog (isReading){
            if(!isReading) {
                // 停止计时器
                window.clearInterval(this.countSecond)
            }
        }
    }
}


</script>