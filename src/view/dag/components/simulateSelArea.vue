<template>
  <g>
    <foreignObject x="-9999" y="-999" width="9999%" height="9999%" style="position: absolute;">
      <body xmlns="http://www.w3.org/1999/xhtml" :style="getSimulateSelArea" id="simulate_sel_area" />
    </foreignObject>
  </g>
</template>

<script>
export default {
  props: {
    simulate_sel_area: {
      type: Object,
      default: () => {
        return {
          left: 0,
          top: 0,
          width: 0,
          height: 0
        }
      }
    }
  },
  computed: {
    getSimulateSelArea () {
      const { left, top, width, height } = this.simulate_sel_area
      return `width: ${width}px; height: ${height}px; left: ${left+9999}px; top: ${top+999}px; border: 3px dashed #289de9; position: absolute; backgroundColor: rgba(255,255,255,0.5);`
    }
  }
}
</script>