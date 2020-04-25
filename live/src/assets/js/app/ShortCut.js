import Mousetrap from "mousetrap";

//快捷键

//切换主题
Mousetrap.bind(
    ["command+t", "ctrl+t"],
    () => {
        var css = document.getElementById("app-skin");
        css.setAttribute(
            "href",
            css.getAttribute("href").includes("dark") ?
            css.getAttribute("href").replace("dark", "light") :
            css.getAttribute("href").replace("light", "dark")
        );
    },
    "keyup"
);

//其他demo
Mousetrap.bind("4", () => {
    console.log("4");
});
Mousetrap.bind("?", () => {
    console.log("show shortcuts!");
});
// combinations
Mousetrap.bind("command+shift+k", () => {
    console.log("command shift k");
});
// map multiple combinations to the same callback
Mousetrap.bind(["command+k", "ctrl+k"], () => {
    console.log("command k or control k");
    // return false to prevent default browser behavior
    // and stop event from bubbling
    return false;
});

// gmail style sequences
Mousetrap.bind("g i", () => {
    console.log("go to inbox");
});
Mousetrap.bind("* a", () => {
    console.log("select all");
});

// konami code!
Mousetrap.bind("up up down down left right left right b a enter", () => {
    console.log("konami code");
});
export default Mousetrap;