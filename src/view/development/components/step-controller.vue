<template>
  <Row>
    <Button type="text" @click="prevStep" style="float: left;" v-show="value.current > 0">
      <Icon type="ios-arrow-back" />
      <span class="margin-left-10">上一步</span>
    </Button>
    <Button v-if="value.current < value.length - 1" type="text" @click="nextStep" style="float: right;" :disabled="disabled">
      <span class="margin-right-10">下一步
        <Icon type="ios-arrow-forward" class="margin-left-10" />
      </span>
    </Button>
    <Button v-else type="text" @click="finish" style="float: right;" :disabled="disabled">
      <span class="margin-right-10">完 成
        <Icon type="md-checkmark" class="margin-left-10"></Icon>
      </span>
    </Button>
  </Row>
</template>

<script>

export default {
  name: 'step-controller',
  props: {
    value: Object,
    disabled: Boolean
  },
  data () {
    return {
    }
  },
  methods: {
    prevStep () {
      this.value.current -= 1
    },
    nextStep () {
      this.value.current += 1
    },
    finish () {
      this.$emit('on-finish')
    }
  },
  watch: {
    'value.current' (current) {
      if (current < 0) this.value.current = 0
      if (current > this.value.length) this.value.current = this.value.length
    }
  }
}
</script>
