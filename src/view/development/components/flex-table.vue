<template>
  <table style="border-collapse: collapse; line-height: 14px; font-size: 14px;">
    <tr>
      <th style="border: 1px solid black; padding: 5px; background-color: #ddd;" v-for="(item, index) in columns" :key="index">{{item}}</th>
    </tr>
    <tr v-for="(row, index) in data" :key="index">
      <td style="border: 1px solid black; padding: 5px;" v-for="(column, i) in columns" :key="i">
        {{row[column]}}
      </td>
    </tr>
  </table>
</template>

<script>
export default {
  name: 'flex-table',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: () => []
    },
  }
}
</script>
