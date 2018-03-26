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
                            <p><b>任务名称</b><a @click="openTask" :title="record.taskName">{{record.taskName}}</a></p>
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
            <Col>
                <Card class="margin-top-10">
                    <p slot="title">
                        <Icon type="ios-film-outline"></Icon>
                        日志详情
                    </p>

    <!--
                    <Input v-model="record.message" type="textarea" :autosize="true" readonly style="font-family:couriernew, courier, monospace;font-size:8px;"></Input>
    -->
                    <pre style="white-space: pre-wrap;word-wrap: break-word;font-family:couriernew, courier;font-size:8px;">{{record.message}}</pre>
                
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


const initColumnList = [
    {
        key: 'taskType',
        title: '任务类型',
        width: 110,
        ellipsis: true
    },
    {
        key: 'taskName',
        title: '调度名称',
        ellipsis: true
    },
    {
        key: 'execType',
        title: '执行方式',
        align: 'center',
        width: 90
    },
    {
        key: 'startTime',
        title: '开始时间',
        align: 'center',
        width: 150
    },
    {
        key: 'durationTime',
        title: '运行时长',
        align: 'center',
        width: 120
    },
    {
        key: 'success',
        title: '运行状态',
        align: 'center',
        width: 100
    },
    {
        key: 'operation',
        title: '操作',
        align: 'center',
        width: 110
    }
];



import moment from 'moment'

export default {
    name: 'monitor',
    components: {
    },
    data () {
        return {
            record:{},
            loadingAgentInfo: false,
            agentInfo:{}
        };
    },
    methods: {
        timeDiff(startTime, endTime){
            const durationTime = endTime - startTime
            const days=Math.floor(durationTime/(24*3600*1000))
            //计算出小时数
            const leave1=durationTime%(24*3600*1000)    //计算天数后剩余的毫秒数
            const hours=Math.floor(leave1/(3600*1000))
            //计算相差分钟数
            const leave2=leave1%(3600*1000)        //计算小时数后剩余的毫秒数
            const minutes=Math.floor(leave2/(60*1000))
            //计算相差秒数
            const leave3=leave2%(60*1000)      //计算分钟数后剩余的毫秒数
            const seconds=Math.round(leave3/1000)
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
                this.record.fireTime = moment(this.record.fireTime).format('YYYY-MM-DD HH:mm:ss')
                this.record.startTime = moment(this.record.startTime).format('YYYY-MM-DD HH:mm:ss')
                this.record.endTime = moment(this.record.endTime).format('YYYY-MM-DD HH:mm:ss')
            }
        })
    }
}


</script>