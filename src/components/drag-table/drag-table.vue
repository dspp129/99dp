<template>
  <div>
    <Table
      :data="value"
      :columns="columns"
      :loading="loading"
      @on-selection-change="onSelectionChange"
      @on-sort-change="onSortChange"
      @on-drag-drop="onDragDrop"
      highlight-row
      draggable
      border
      stripe
      size="small" />
  </div>
</template>

<script>

export default {
  name: 'drag-table',
  props: {
    value: Array,
    loading: Boolean,
    columns: Array
  },
  methods: {
    onDragDrop (index1, index2) {
      const start = this.value[index1]
      this.value.splice(index1, 1)
      this.value.splice(index2, 0, start)
    },
    onSelectionChange (e) {
      const selected = e.map(row => row.columnName)
      this.value.forEach((row, index) => {
        const isChecked = selected.includes(row.columnName)
        if (row._checked !== isChecked) {
          row._checked = isChecked
          this.value.splice(index, 1, row)
        }
      })
    },
    onSortChange (e) {
      this.value.sort((a, b) => {
        return e.order === 'desc' ? b.columnName.localeCompare(a.columnName) : a.columnName.localeCompare(b.columnName)
      })
    }
  },
  mounted () {
  },
  watch: {
  }
}
</script>
