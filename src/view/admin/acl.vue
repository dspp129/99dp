<template>
  <div>acl</div>
</template>

<script>
export default {
  name: 'admin-acl',
  computed: {
    minHeight () {
      return this.$store.state.app.fullHeight + 'px'
    }
  }
}
</script>
