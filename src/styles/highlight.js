import Vue from 'vue'
import Hljs from 'highlight.js'
import 'highlight.js/styles/googlecode.css'


Hljs.highlightCode = () => { //自定义highlightCode方法，将只执行一次的逻辑去掉
    let blocks = document.querySelectorAll('pre code');
    [].forEach.call(blocks, hljs.highlightBlock);
};

let Highlight = {}
Highlight.install = (Vue, options) => {
    Vue.directive('highlight', function (el) {

        const blocks = el.querySelectorAll('pre code');


        blocks.forEach((block) => {
            Hljs.highlightBlock(block)
        })
    })
}

export default Highlight