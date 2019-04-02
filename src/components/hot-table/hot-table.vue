<style lang="less">
@import '~handsontable/dist/handsontable.full.min.css';
</style>

<template>
  <HotTable :data="data"
    :columns="columnList"
    :colHeaders="columns"
    :stretchH="stretchH"
    :readOnly="true"
    :rowHeaders="true"
    :height="height"
    :width="width"
    :copyPaste="true"
    :manualColumnResize="true"
    :manualRowResize="true"
    licenseKey="non-commercial-and-evaluation">
  </HotTable>
</template>

<script>

import { HotTable } from '@handsontable/vue'

export default {
  name: 'hot-table',
  components: {
    HotTable
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: () => []
    },
    stretchH: {
      type: String,
      default: 'none'
    },
    height: true,
    width: true
  },
  data () {
    return {
      columnList: []
    }
  },
  watch: {
    columns (columns) {
      this.columnList = columns.map(e => {
        return { data: e }
      })
    }
  }
}

</script>