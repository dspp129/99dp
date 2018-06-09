<template>
    <div>
        <ButtonGroup shape="circle">
            <Button :type="type" :disabled="currentPage === 1" @click="first" icon="ios-skipbackward"></Button>
            <Button :type="type" :disabled="currentPage === 1" @click="prev" icon="arrow-left-b"></Button>
            <Button type="text" disabled>{{ currentPage }} / {{ lastPage }} </Button>
            <Button :type="type" :disabled="currentPage >= lastPage" @click="next" icon="arrow-right-b"></Button>
            <Button :type="type" :disabled="currentPage >= lastPage" @click="last" icon="ios-skipforward"></Button>
        </ButtonGroup>
        <Select v-model="pageSize" style="width:80px">
            <Option v-for="item in pageList" :value="item.value" :key="item.value">{{item.label}}</Option>
        </Select>
        <span>共 {{total}} 条</span>
    </div>
</template>

<script>

export default {
    name: 'Pagination',
    props: {
        current: Number,
        total: Number,
        size: {
            type: Number,
            default: 10
        }
    },
    data () {
        return {
            firstAble: true,
            prevAble: true,
            lastAble: false,
            nextAble: false,
            pageList : Array,
            type : 'info',
            currentPage: this.current,
            pageSize: this.size
        };
    },
    methods: {
        first () {
            this.currentPage = 1
            this.$emit("on-current-change", this.currentPage)
        },
        prev () {
            if(this.currentPage > 0){
                this.currentPage -= 1
                this.$emit("on-current-change", this.currentPage)
            }
        },
        next () {
            if(this.currentPage < this.lastPage){
                this.currentPage += 1
                this.$emit("on-current-change", this.currentPage)
            }
        },
        last () {
            this.currentPage = this.lastPage
            this.$emit("on-current-change", this.currentPage)
        }
    },
    watch : {
        size (size){
            // 该watch不会被触发，因为reset时不重置size
            this.pageSize = size
        },
        current (current){
            // 外部传入，不触发回调
            this.currentPage = current
            //this.$emit("on-current-change", this.currentPage)
        },
        pageSize (pageSize){
            this.currentPage = 1
            this.$emit("on-size-change", pageSize)
        }/*,
        currentPage (currentPage){
            this.$emit("on-current-change", currentPage)
        }
        */
    },
    computed: {
        lastPage: function () {
            return Math.ceil(this.total/this.pageSize);
        }
    },
    mounted () {
        this.pageList = [10,20,30,50].map(x=>{ return { value: x, label: x + ' 条/页'}})
    }
};
</script>


