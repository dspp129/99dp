<template>
  <div class="clearfix">
    <slot name="table"></slot>
    <div class="footer">
      <div class="float-left">
        <Select transfer style="width: 80px;" v-model="filter.size" @on-change="pageSizeChange">
          <Option v-for="item in pageArr" :value="item" :key="item">{{item}}&nbsp;条/页</Option>
        </Select>
      </div>
      <div class="float-right">
        <span>共&nbsp;{{total}}&nbsp;条</span>&nbsp;
        <ButtonGroup shape="circle">
          <Button :disabled="filter.page === 1" @click="first">首页</Button>
          <Button :disabled="filter.page === 1" @click="prev">上一页</Button>
          <Button type="text" disabled ghost>{{ filter.page }}&nbsp;/&nbsp;{{ lastPage }}</Button>
          <Button :disabled="filter.page >= lastPage" @click="next">下一页</Button>
          <Button :disabled="filter.page >= lastPage" @click="last">末页</Button>
        </ButtonGroup>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'pagination',
  props: {
    total: {
      type: Number,
      default: 0
    },
    size: {
      type: Number,
      default: 10
    }
  },
  components: {
  },
  data () {
    return {
      pageArr: [5, 10, 20, 30, 50],
      filter: {
        page: 1,
        size: this.size
      }
    }
  },
  methods: {
    // 页数修改
    pageSizeChange (size) {
      this.filter.page = 1
      this.filter.size = size
      this.sendPageInfo()
    },
    // 触发修改页数事件
    sendPageInfo () {
      this.$emit('on-page-info-change', this.filter)
    },
    // 用于重置搜索条件
    resetPage () {
      this.filter.page = 1
    },
    // 翻页
    first () {
      this.filter.page = 1
      this.sendPageInfo()
    },
    prev () {
      if (this.filter.page > 0) {
        this.filter.page -= 1
        this.sendPageInfo()
      }
    },
    next () {
      if (this.filter.page < this.lastPage) {
        this.filter.page += 1
        this.sendPageInfo()
      }
    },
    last () {
      this.filter.page = this.lastPage
      this.sendPageInfo()
    }
  },
  computed: {
    lastPage: function () {
      return this.total > 0 ? Math.ceil(this.total / this.filter.size) : 1
    }
  },
  watch: {
  },
  beforeDestroy () {
  },
  mounted () {
  }
}
</script>

<style lang="less">
.footer {
  margin-top: 10px;
  .ivu-select-dropdown {
    z-index: 1000;
  }
}
.clearfix:before, .clearfix:after {
  content: "";
  display: table;
}
.clearfix:after {
  clear: both;
}
.clearfix {
  *zoom: 1;
}
.float-left {
  float: left;
}
.float-right {
  float: right;
}
</style>
