const { FileManager } = require('catalyst-core').manager;
const { PathManager } = require('catalyst-plugin').manager;
const NodeSwitcher = require('catalyst-plugin').NodeSwitcher;
const { ExPackage } = require('catalyst-core');

var _controller = new window.controller('CatalystFigma', 'figma');

window.onmessage = (event) => {
    let type = event.data.pluginMessage.type;
    let data = event.data.pluginMessage.data;

    if (type === 'explugin_render') {
        _controller.render(data)
    }
    if (type === 'explugin_send') {
        _controller.set(data)
    }

    if (type === 'explugin_update') {
        //console.log("GUI传出信息EX")
        let node = _controller.output();
        parent.postMessage({ pluginMessage: { type: 'update', data: node } }, '*')
    }

    if (type === 'explugin_export') {
        let pack = new figmaExPackage(data);

        let buffer = pack.pack();
        let name = pack.getName();

        FileManager.export(name, buffer)
    }

}

//重置图层信息
_controller.handler.sender = function (name, data) {
    parent.postMessage({ pluginMessage: { type: name, data: data } }, '*')
}

//更改节点类型
_controller.handler.switcher = NodeSwitcher
_controller.handler.updater = function (newnode) {
    parent.postMessage({ pluginMessage: { type: 'update', data: newnode } }, '*')
}

//导出
_controller.handler.exporter = function (etype, op) {
    console.log("export", etype, op)
    // var returnExVar = _controller.output()
    // console.log("返回当前界面信息:", returnExVar)
    parent.postMessage({ pluginMessage: { type: 'export', data: { type: etype, options: op } } }, '*')
}

//导入
_controller.handler.importer = function (name, buffer, op) {
    console.log("import", name);
    var pack = new ExPackage();
    pack.unpack(buffer);
    parent.postMessage({ pluginMessage: { type: 'import', data: { name: name, pack: pack, options: op } } }, '*')
}


_controller.config = { initNodeName: 
    { desc: '初始化节点名', value: true, type: 'toogle' }
};

_controller.initSetup();
_controller.home();


class figmaExPackage extends ExPackage {
    constructor(args) {
        super(args);
    }
}