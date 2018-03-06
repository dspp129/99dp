<template>
    <div>report auto detail</div>
</template>

<script>


import Pagination from '../my-components/pagination'

export default {
    name: 'report-auto',
    components: {
        Pagination
    },
    data () {
        return {
            loadingPage: false,

            total: 0,
            current: 1,
            size: 10,
            reportDetail: {},

            columnList: [],
            reportList: [],

            attachmentTypeList:[]

        };
    },
    methods: {
        init () {
            const req = this.$route.params
            const name = req.name

            this.$http.get(`/api/report/auto/${name}`).then(res=>{
                const result = res.data
                if(result.code===0){
                    this.reportDetail = result.data
                    console.log(this.reportDetail);
                } else {
                    this.$router.go(-1);
                }
            })
        }
    },
    mounted () {
        this.attachmentTypeList = [
            {
                id:'1', attachmentType:'Excel'
            },
            {
                id:'2', attachmentType:'Zip压缩'
            }
        ]

        this.init();

    },
    created () {
    }
}
</script>