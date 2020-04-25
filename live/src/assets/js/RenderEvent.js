const { ipcRenderer, remote } = require("electron");

const renderEvent = function(events, args = {}) {
    ipcRenderer.send(events, args);
};

export default renderEvent;