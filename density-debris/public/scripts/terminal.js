(function () {
    const log = document.getElementById("term-log");
    const phoneCaption = document.getElementById("term-phone-caption");
    const chips = document.getElementById("term-chips");
    const typed = document.getElementById("term-typed");
    const enter = document.getElementById("term-enter");
    const phoneForm = document.getElementById("term-phone");
    const desktopCaption = document.getElementById("term-desktop-caption");
    const suggest = document.getElementById("term-suggest");
    const input = document.getElementById("term-input");
    const mirror = document.getElementById("term-mirror");
    const rest = document.getElementById("term-rest");
    const desktopForm = document.getElementById("term-desktop");
    if (!log || !input) return;

    function cardText(entry) {
        const lines = [entry.name, entry.caption, entry.description].filter((line) => line);
        if (entry.tags && entry.tags.length) lines.push("Tech: " + entry.tags.join(", "));
        if (entry.github) lines.push("GitHub: " + entry.github);
        if (entry.body) lines.push(entry.body);
        return lines.join("\n");
    }

    function directory(entries) {
        const children = {};
        entries.forEach((entry) => {
            children[entry.slug] = { kind: "file", text: cardText(entry) };
        });
        return { kind: "dir", children };
    }

    const catalogNode = document.getElementById("terminal-catalog");
    const catalog = catalogNode ? JSON.parse(catalogNode.textContent) : { projects: [], work: [] };
    const root = {
        kind: "dir",
        children: {
            projects: directory(catalog.projects || []),
            work: directory(catalog.work || []),
        },
    };
    const commands = ["ls", "cd", "cat", "help", "whoami", "clear", "pwd", "exit"];
    const secondary = new Set(["help", "whoami", "clear", "pwd", "exit"]);
    const described = [
        ["ls", "list a directory"],
        ["cd", "enter a directory"],
        ["cat", "read a file"],
        ["help", "show commands and examples"],
        ["whoami", "print the introduction"],
        ["clear", "wipe the screen"],
        ["pwd", "print the current directory"],
        ["exit", "return to light mode"],
    ];
    const noArg = new Set(["whoami", "help", "pwd", "clear", "exit"]);
    const helpText = [
        "The available commands are:",
        "ls  cd  cat  help  whoami  clear  pwd  exit",
        "",
        "whoami  print the introduction",
        "pwd     print the current directory",
        "clear   wipe the screen",
        "exit    return to light mode",
        "",
        "Examples of how to use these commands:",
        "ls projects     list that directory",
        "cd projects     enter the directory",
        "cat work/aws    read a file from anywhere",
        "cat projects    returns an error since projects is a directory",
    ].join("\n");

    let cwd = "~";
    let line = "";
    let picked = 0;
    let history = [];
    let historyAt = 0;
    let draft = "";
    let started = false;
    let phoneTaught = false;
    const phoneKey = "portfolio-phone-hint";
    const phoneState = JSON.parse(localStorage.getItem(phoneKey) || "{\"visits\":0,\"used\":false}");
    const desktopKey = "portfolio-desktop-tab-hint";
    const desktopState = JSON.parse(localStorage.getItem(desktopKey) || "{\"visits\":0,\"used\":false}");
    let showPhoneHint = !phoneState.used && phoneState.visits < 2;
    let showTabHint = !desktopState.used && desktopState.visits < 2;

    function dark() {
        return document.documentElement.getAttribute("data-theme") === "dark";
    }

    function wide() {
        return window.matchMedia("(min-width: 769px)").matches;
    }

    function promptText() {
        return "amy@lee:" + cwd + "$";
    }

    function cwdParts() {
        return cwd === "~" ? [] : cwd.slice(2).split("/");
    }

    function nodeAt(parts) {
        let node = root;
        for (const seg of parts) {
            if (!node || node.kind !== "dir" || !node.children[seg]) return null;
            node = node.children[seg];
        }
        return node;
    }

    function resolve(path) {
        const parts = cwdParts();
        for (const seg of path ? path.split("/") : []) {
            if (seg === "" || seg === ".") continue;
            if (seg === "..") parts.pop();
            else parts.push(seg);
        }
        return { parts, node: nodeAt(parts) };
    }

    function here() {
        return nodeAt(cwdParts());
    }

    function stick() {
        log.scrollTop = log.scrollHeight;
    }

    function printCommand(text) {
        const row = document.createElement("div");
        row.className = "term-entry";
        const marker = document.createElement("span");
        marker.className = "term-prompt";
        marker.textContent = promptText() + " ";
        row.append(marker, document.createTextNode(text));
        log.append(row);
        stick();
    }

    function printOutput(text) {
        const row = document.createElement("div");
        row.className = "term-out";
        row.textContent = text;
        log.append(row);
        stick();
    }

    function printWhoami() {
        const row = document.createElement("div");
        row.className = "term-out";
        row.append(document.createTextNode("Amy Lee\nI'm a master's student studying CS at the University of Michigan. I graduated with a Bachelor's degree in CS from the University of Michigan in 2026. Go blue!\nSoftware engineering intern at AWS (May-August 2026)\nSoftware engineering intern at AWS (May-August 2025)\nEmbedded systems intern at Nexteer (May-August 2024)\n\n"));
        const links = [
            ["Email: ", "mailto:amyrlee@umich.edu", "amyrlee@umich.edu"],
            ["Linkedin: ", "https://www.linkedin.com/in/amy-lee-umich", "https://www.linkedin.com/in/amy-lee-umich"],
            ["GitHub: ", "https://github.com/tessaSlice", "https://github.com/tessaSlice"],
        ];
        links.forEach(([prefix, href, label], index) => {
            if (index) row.append(document.createTextNode("\n"));
            row.append(document.createTextNode(prefix));
            const anchor = document.createElement("a");
            anchor.href = href;
            anchor.textContent = label;
            if (!href.startsWith("mailto:")) {
                anchor.target = "_blank";
                anchor.rel = "noopener noreferrer";
            }
            row.append(anchor);
        });
        log.append(row);
        stick();
    }

    function childLabels(dir, prefix) {
        if (!dir || dir.kind !== "dir") return [];
        return Object.entries(dir.children)
            .filter(([name]) => name.startsWith(prefix) && name !== prefix)
            .map(([name, node]) => (node.kind === "dir" ? name + "/" : name));
    }

    function catChips(path) {
        if (!path) return childLabels(here(), "");
        const bits = path.split("/");
        const closed = path.endsWith("/");
        const partial = closed ? "" : bits.pop();
        const parent = resolve(bits.join("/")).node;
        if (!parent || parent.kind !== "dir") return [];
        if (!closed && partial && parent.children[partial]) {
            const exact = parent.children[partial];
            if (exact.kind === "file") return [];
            return childLabels(exact, "");
        }
        return childLabels(parent, partial || "");
    }

    function dirChips(prefix, command) {
        const names = cwd === "~" ? ["projects", "work"] : command === "cd" ? [".."] : [];
        return names.filter((name) => name.startsWith(prefix) && name !== prefix);
    }

    function phoneSuggestions() {
        const value = line;
        const parts = value.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return commands.slice();
        const command = parts[0].toLowerCase();
        if (parts.length === 1) {
            if (command === "ls" || command === "cd") return dirChips("", command);
            if (command === "cat") return catChips("");
            if (noArg.has(command)) return [];
            return commands.filter((name) => name.startsWith(command) && name !== command);
        }
        if (command === "cat") return catChips(parts.slice(1).join(" "));
        if ((command === "ls" || command === "cd") && parts.length === 2) {
            return dirChips(parts[1].toLowerCase(), command);
        }
        return [];
    }

    function desktopOptions() {
        const value = line;
        const parts = value.split(/\s+/);
        const command = (parts[0] || "").toLowerCase();
        if (!value.trim()) {
            return described.map(([name, hint]) => ({ fill: name, label: name, hint }));
        }
        if (parts.length === 1 && !value.endsWith(" ")) {
            return described
                .filter(([name]) => name.startsWith(command) && name !== command)
                .map(([name, hint]) => ({ fill: name, label: name, hint }));
        }
        if (noArg.has(command)) return [];
        const arg = parts.slice(1).join(" ");
        if ((command === "ls" || command === "cd") && parts.length > 2) return [];
        if (command === "ls" || command === "cd") {
            return dirChips(arg.toLowerCase(), command).map((name) => ({
                fill: command + " " + name,
                label: name,
                hint: "",
            }));
        }
        if (command !== "cat" || parts.length > 2) return [];
        return catChips(arg).map((label) => {
            const name = label.replace(/\/$/, "");
            const bits = arg.split("/");
            const closed = arg.endsWith("/");
            const last = closed ? "" : bits[bits.length - 1];
            const parentPath = closed ? arg : bits.slice(0, -1).join("/");
            const parent = resolve(parentPath).node;
            const exact = parent && parent.kind === "dir" && last && parent.children[last];
            const piece = exact && exact.kind === "dir" ? arg + "/" + name : (parentPath ? parentPath + "/" : "") + name;
            return { fill: "cat " + piece.replace(/^\//, ""), label, hint: "" };
        });
    }

    function renderPhone() {
        const names = phoneSuggestions();
        chips.replaceChildren();
        phoneCaption.classList.toggle("is-gone", phoneTaught || names.length === 0);
        names.forEach((name) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = secondary.has(name) ? "term-chip secondary" : "term-chip";
            button.textContent = name;
            button.addEventListener("click", () => acceptPhone(name));
            chips.append(button);
        });
    }

    function renderDesktop() {
        const list = desktopOptions().slice(0, 3);
        if (picked >= list.length) picked = 0;
        const current = list[picked];
        mirror.textContent = line;
        rest.textContent = current && current.fill.startsWith(line) ? current.fill.slice(line.length) : "";
        suggest.replaceChildren();
        suggest.classList.toggle("is-empty", list.length === 0);
        desktopCaption.classList.toggle("is-gone", !showTabHint);
        list.forEach((item, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "term-option" + (index === picked ? " is-on" : "");
            button.textContent = item.label;
            button.addEventListener("click", () => {
                setLine(item.fill);
                input.focus();
            });
            suggest.append(button);
        });
        stick();
    }

    function refresh() {
        typed.textContent = line;
        enter.disabled = line.trim() === "";
        if (document.activeElement !== input) input.value = line;
        document.querySelectorAll("[data-prompt]").forEach((node) => {
            node.textContent = promptText();
        });
        renderPhone();
        renderDesktop();
        place();
    }

    function setLine(value) {
        line = value;
        input.value = value;
        refresh();
    }

    function acceptPhone(label) {
        const name = label.replace(/\/$/, "");
        const parts = line.trim().split(/\s+/).filter(Boolean);
        if (commands.includes(name) && parts.length <= 1) setLine(name);
        else if ((parts[0] || "").toLowerCase() === "cat") {
            const path = parts.slice(1).join(" ");
            if (!path) setLine("cat " + name);
            else {
                const bits = path.split("/");
                const last = bits[bits.length - 1];
                const parent = resolve(bits.slice(0, -1).join("/")).node;
                const exact = parent && parent.kind === "dir" && parent.children[last];
                if (exact && exact.kind === "dir") setLine("cat " + path + "/" + name);
                else {
                    bits[bits.length - 1] = name;
                    setLine("cat " + bits.filter(Boolean).join("/"));
                }
            }
        } else setLine((parts[0] || "") + " " + name);
        if (!phoneTaught) {
            phoneTaught = true;
            phoneState.used = true;
            localStorage.setItem(phoneKey, JSON.stringify(phoneState));
            phoneCaption.classList.add("is-gone");
        }
    }

    function run(raw) {
        const text = raw.trim();
        printCommand(raw);
        setLine("");
        if (!text) return;
        history.push(text);
        historyAt = history.length;
        draft = "";
        if (/[|&;<>`$\\()'"]/.test(text)) {
            printOutput("Pipes, redirects, quotes, and chaining are not available. None of these commands read another command's output.");
            return;
        }
        const parts = text.split(/\s+/);
        const name = parts[0].toLowerCase();
        const arg = parts.slice(1).join(" ");
        const known = commands.includes(name);
        if (!known) printOutput("command not found: " + parts[0]);
        else if (noArg.has(name) && arg) printOutput(name + " does not take arguments.");
        else if ((name === "ls" || name === "cd" || name === "cat") && parts.length > 2) printOutput(name + " takes one path.");
        else if (name === "whoami") printWhoami();
        else if (name === "help") printOutput(helpText);
        else if (name === "pwd") printOutput(cwd);
        else if (name === "clear") {
            const spacer = log.querySelector(".log-spacer");
            log.replaceChildren(spacer || document.createElement("div"));
            if (!spacer) log.firstChild.className = "log-spacer";
        } else if (name === "ls") {
            if (!arg) printOutput(Object.keys(here().children).join("\n") || "(empty)");
            else {
                const found = resolve(arg);
                if (!found.node) printOutput("ls: cannot access '" + arg + "': No such file or directory");
                else if (found.node.kind === "file") printOutput(arg + " is a file. cat " + arg);
                else printOutput(Object.keys(found.node.children).join("\n"));
            }
        } else if (name === "cd") {
            if (!arg) printOutput("cd needs a directory.");
            else {
                const found = resolve(arg);
                if (!found.node) printOutput("cd: not a directory: " + arg);
                else if (found.node.kind === "file") printOutput(arg + " is a file. cat " + arg);
                else cwd = found.parts.length ? "~/" + found.parts.join("/") : "~";
            }
        } else if (name === "cat") {
            if (!arg) printOutput("cat needs a path.");
            else {
                const found = resolve(arg);
                if (!found.node) printOutput("No file named " + arg + ".");
                else if (found.node.kind === "dir") printOutput("cat: " + arg + ": is a directory");
                else printOutput(found.node.text);
            }
        } else if (name === "exit") {
            printOutput("Returning to the website.");
            document.getElementById("theme-toggle").click();
        }
        refresh();
    }

    function place() {
        const header = document.querySelector("header");
        if (header) {
            document.documentElement.style.setProperty("--term-top", header.offsetHeight + "px");
        }
    }

    function noteVisit() {
        if (!phoneState.used) {
            phoneState.visits += 1;
            localStorage.setItem(phoneKey, JSON.stringify(phoneState));
            showPhoneHint = !phoneState.used && phoneState.visits <= 2;
            if (!showPhoneHint) phoneTaught = true;
        }
        if (!desktopState.used) {
            desktopState.visits += 1;
            localStorage.setItem(desktopKey, JSON.stringify(desktopState));
            showTabHint = !desktopState.used && desktopState.visits <= 2;
        }
    }

    function openIfNeeded() {
        place();
        if (!dark()) return;
        if (!started) {
            started = true;
            noteVisit();
            run("help");
        }
        if (wide()) input.focus();
    }

    const app = log.closest(".terminal-app");
    app.addEventListener("click", (event) => {
        if (!wide() || !dark()) return;
        if (event.target.closest("a, button, input, textarea")) return;
        const selected = window.getSelection();
        if (selected && !selected.isCollapsed) return;
        input.focus();
        const end = input.value.length;
        input.setSelectionRange(end, end);
    });

    phoneForm.addEventListener("submit", (event) => {
        event.preventDefault();
        run(line);
    });
    desktopForm.addEventListener("submit", (event) => {
        event.preventDefault();
        run(input.value);
    });
    input.addEventListener("input", () => {
        line = input.value;
        typed.textContent = line;
        picked = 0;
        refresh();
    });
    input.addEventListener("keydown", (event) => {
        const list = desktopOptions().slice(0, 3);
        if (event.key === "Tab") {
            event.preventDefault();
            if (showTabHint) {
                showTabHint = false;
                desktopState.used = true;
                localStorage.setItem(desktopKey, JSON.stringify(desktopState));
            }
            if (list[picked]) setLine(list[picked].fill);
            return;
        }
        if (event.key === "ArrowDown" && list.length && line.trim()) {
            event.preventDefault();
            picked = (picked + 1) % list.length;
            renderDesktop();
            return;
        }
        if (event.key === "ArrowUp" && list.length && line.trim()) {
            event.preventDefault();
            picked = (picked - 1 + list.length) % list.length;
            renderDesktop();
            return;
        }
        if (event.key === "ArrowUp" && !line.trim()) {
            event.preventDefault();
            if (!history.length) return;
            if (historyAt === history.length) draft = line;
            historyAt = Math.max(0, historyAt - 1);
            setLine(history[historyAt]);
        }
    });

    new MutationObserver(openIfNeeded).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
    });
    window.addEventListener("resize", place);
    document.addEventListener("DOMContentLoaded", openIfNeeded);
    openIfNeeded();
})();
