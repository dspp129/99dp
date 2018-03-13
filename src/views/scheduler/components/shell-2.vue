<template>
    <Row :gutter="10" class="margin-top-10">
        <Col>
            <Card>
                <p slot="title">
                    <Icon type="code-working"></Icon>
                    Shell详情
                </p>
                <Input v-model="value.shell" type="textarea" :autosize="{minRows: 12}" ></Input>
            </Card>
        </Col>
    </Row>
</template>

<script>

export default {
    name: 'shell-2',
    props : {
        value : Object
    },
    data () {
        return {
        };
    },
    methods : {
    },
    computed : {
    },
    mounted () {
    }
};
</script>

