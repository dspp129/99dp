<template>
    <DatePicker type="daterange" :options="dateOptions" @on-change="onDateChange" placement="bottom-start" placeholder="请选择起止日期" style="width: 200px">
    </DatePicker>
</template>

<script>

export default {
    name: 'date-range-picker',
    data () {
        return {
            startDate: '',
            endDate: '',

            dateOptions: {
                shortcuts: [
                    {
                        text: '今天',
                        value () {
                            const end = new Date();
                            const start = new Date();
                            return [start, end];
                        }
                    },
                    {
                        text: '昨天',
                        value () {
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 1);
                            const end = start;
                            return [start, end];
                        }
                    },
                    {
                        text: '最近三天',
                        value () {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 2);
                            return [start, end];
                        }
                    },
                    {
                        text: '最近一周',
                        value () {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 6);
                            return [start, end];
                        }
                    },
                    {
                        text: '最近一月',
                        value () {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            return [start, end];
                        }
                    }
                ]
            }
        }
    },
    methods: {
        onDateChange (val) {
            this.startDate = val[0]
            this.endDate = val[1]
            if(this.startDate === '') {
                this.endDate = ''
            }
            this.$emit('on-date-change', [this.startDate, this.endDate])
        }
    },
}

</script>