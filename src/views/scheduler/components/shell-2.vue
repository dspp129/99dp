<template>
    <Row :gutter="10" class="margin-top-10">
        <Col>
            <Card icon="code-working" title="Shell详情">
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

