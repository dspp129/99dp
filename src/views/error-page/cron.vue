<template>
    <Form>
        <FormItem label="Cron表达式">
            <Input 
                v-model.trim="cronExpr"
                style="width: 210px">
            </Input>
            <Dropdown 
                trigger="click"
                placement="bottom"
                style="margin-left: 10px">
                <Button icon="ios-lightbulb"
                    type="primary"
                    size="small"
                    shape="circle">
                </Button>
                <DropdownMenu slot="list" style="width: 590px">
                    <select size="8" multiple="multiple" style="width:80px;" v-model="cronYear">
                        <option value="*" selected="selected">每年</option>
                        <option v-for="i in 20" :value="i + 2017">{{i + 2017}}年</option>
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
    </Form>
</template>

<script>

export default {
    name: 'cron-expr',
    data () {
        return {
            cronYear: ['*'],
            cronMonth: ['*'],
            cronDay: ['*'],
            cronWeek: ['*'],
            cronHour: ['*'],
            cronMinute: ['*'],
            cronSecond: []
        };
    },
    methods : {
        
    },
    watch : {
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
                return '';
            }
            cronExp += year;
            return cronExp;
        }
    },
    mounted () {
    }
};
</script>
