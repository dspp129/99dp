<template>
    <div>
        <v-html-panel :url.asyc="url1"></v-html-panel>
    </div>
</template>

<script>


export default {
    name: 'spark-ui',
    
    data () {
        return {
            url1: ''
        }
    },
    mounted () {
        this.url1 = 'http://dm-dev-02:8090'
    },
    methods: {
    }
 }
</script>