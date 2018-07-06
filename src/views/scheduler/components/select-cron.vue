<template>
    <Modal
        v-model="showing"
        title="选择Cron表达式"
        width="620"
        class-name="modal-vertical-center">
        <div slot="footer">
            <Button type="ghost" shape="circle" icon="close" @click="close"></Button>
            <Button type="success" shape="circle" icon="checkmark-round" @click="ok" :disabled="runTimeList.length === 0"></Button>
        </div>
        <Row type="flex" justify="center" align="middle" >
            <select @change="changeCron" size="8" multiple="multiple" style="width:75px;" v-model="cronYear">
                <option value="*" selected="selected">每年</option>
                <option v-for="i in 20" :value="i + 2017">{{i + 2017}}年</option>
            </select>
            <select @change="changeCron" size="8" multiple="multiple" style="width:75px;" v-model="cronMonth">
                <option value="*" selected="selected">每月</option>
                <option v-for="i in 12" :value="i">{{i}}月</option>
            </select>
            <select @change="changeCron" size="8" multiple="multiple" style="width:75px;" v-model="cronDay">
                <option value="*" selected="selected">每日</option>
                <option v-for="i in 31" :value="i">{{i}}日</option>
            </select>
            <select @change="changeCron" size="8" multiple="multiple" style="width:75px;" v-model="cronWeek">
                <option value="*" selected="selected">每星期</option>
                <option value="1">星期天</option>
                <option value="2">星期一</option>
                <option value="3">星期二</option>
                <option value="4">星期三</option>
                <option value="5">星期四</option>
                <option value="6">星期五</option>
                <option value="7">星期六</option>
            </select>
            <select @change="changeCron" size="8" multiple="multiple" style="width:75px;" v-model="cronHour">
                <option value="*">每小时</option>
                <option v-for="i in 24" :value="i - 1">{{i-1}}时</option>
            </select>
            <select @change="changeCron" size="8" multiple="multiple" style="width:75px;" v-model="cronMinute">
                <option value="*">每分钟</option>
                <option v-for="i in 60" :value="i - 1">{{i-1}}分</option>
            </select>
            <select @change="changeCron" size="8" multiple="multiple" style="width:75px;" v-model="cronSecond">
                <option value="*">每秒</option>
                <option value="0" selected="selected">0秒</option>
                <option v-for="i in 59" :value="i">{{i}}秒</option>
            </select>
        </Row>
        <Row type="flex" justify="center" align="middle" class="margin-top-10">
            <div style="width:525px;">
                <Col span="16">
                    <Input size="large" placeholder="选择上方时钟与分钟" v-model="cronExpr"></Input>
                </Col>
                <Col span="4">
                    <Poptip v-model="visible" title="最近5次运行时间" placement="bottom-end" transfer style="float: right;">
                         <Button type="primary" @click="check" :disabled="cronExpr.length === 0">检验</Button>
                        <div slot="content">
                            <p v-for="(item,index) in runTimeList" :key="index" :value="index">{{formatDateTime(item)}}</p>
                        </div>
                    </Poptip>
                </Col>
                <Col span="4">
                    <Button @click="init" style="float: right;">重置</Button>
                </Col>
            </div>
        </Row>
    </Modal>
</template>

<script>

import Util from '@/libs/util';

export default {
    name: 'select-cron',
    props: {
        value: Boolean
    },
    data () {
        return {
            cronYear: ['*'],
            cronMonth: ['*'],
            cronDay: ['*'],
            cronWeek: ['*'],
            cronHour: [],
            cronMinute: [],
            cronSecond: ['0'],

            cronExpr: '',
            checking: false,
            runTimeList: [],
            showing: false,
            visible: false
        }
    },
    methods: {
        ok () {
            this.$emit('on-change-cron', this.cronExpr)
            this.close()
        },
        close () {
            this.$emit('input', false)
            this.init()
        },
        changeCron () {
            this.$Message.destroy()

            if(this.cronHour.length === 0) {
                this.cronExpr = '';
                return;
            }
            if(this.cronMinute.length === 0) {
                this.cronExpr = '';
                return;
            }
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
            if(!week){
                week="*";
            }
            if(week.length > 1 && week.indexOf("*") === 0){
                week = week.toString().substr(2);
            }
            if(week > 0){
                week = parseInt(week);
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

            let cronExpr = seconds + " " + minutes + " " + hour + " " ;
            if(week == "*"){
                cronExpr += day + " " + month + " ? ";
            }else if(day == "*" && week != "*"){
                cronExpr += "? " + month + " " + week + " ";
            }else if(day != "*" && week != "*"){
                this.$Message.error({
                    content: '日期和星期不能同时选择！',
                    duration: 10,
                    closable: true})

                this.cronExpr = '';
                return;
            }
            cronExpr += year;
            this.cronExpr = cronExpr;
        },
        init () {
            this.cronYear = ['*']
            this.cronMonth = ['*']
            this.cronDay = ['*']
            this.cronWeek = ['*']
            this.cronHour = []
            this.cronMinute = []
            this.cronSecond = ['0']
            this.cronExpr = ''
            this.checking = false,
            this.runTimeList = []
        },
        check () {
            this.checking = true
            this.visible = false
            this.runTimeList = []
            this.getRequest(`/scheduler/checkCron?cronExpr=${this.cronExpr}`).then(res => {
                this.checking = false
                const result = res.data;
                if(result.code === 0){
                    this.runTimeList = result.data
                    this.visible = true
                } else {
                    this.$Message.error('Cron表达式有误，请重新输入。')
                }
            })
        },
        formatDateTime(date){
            return Util.formatDateTime(date)
        }
    },

    computed : {
    },
    watch : {
        value (value) {
            this.showing = value
        },
        showing (showing){
            if(!showing){
                this.close()
            }
        }
    }
};
</script>