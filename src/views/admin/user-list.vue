<template>
    <UnderConstruction></UnderConstruction>
</template>

<script>

import UnderConstruction from '@/views/my-components/underConstruction';


export default {
    name: 'user-list',
    components : {
        UnderConstruction
    },
    data () {
        return {
            
        }
    },
    methods: {
    },
    created () {
    },
    activated () {
    },
    deactivated (){
    },
    mounted () {
    },
    computed : {
    },
    watch: {
    }
};

</script>

<style lang="less">
.img-box{  
    padding-top:100%;  
}

.img-box img{  
    position:absolute;  
    top:0;  
    bottom:0;  
    left:0;  
    right:0;  
    width:100%;
}
</style>