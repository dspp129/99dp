<template>
  <div>log</div>
</template>

<script>
export default {
  name: 'admin-log',
  computed: {
    minHeight () {
      return this.$store.state.app.fullHeight - 125 + 'px'
    }
  }
}
</script>
