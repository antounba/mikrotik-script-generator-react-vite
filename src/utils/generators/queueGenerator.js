export const generateQueueScript = (queues) => {
    let script = "";
    const parentsMade = [];

    queues.forEach((q) => {
        const speed = `${q.upload}${q.upload_unit}/${q.download}${q.download_unit}`;
        const ip = q.ip;
        const name = (q.name || "").toUpperCase();
        const parent = (q.parent || "").toUpperCase();
        const comment = q.comment || "";

        if (parent && !parentsMade.includes(parent)) {
            script += `:if ([:len [/queue simple find name="${parent}"]] = 0) do={\n`;
            script += `  /queue simple add name="${parent}" target="" max-limit=0/0\n`;
            script += `} else={\n`;
            script += `  /queue simple set [find name="${parent}"] max-limit=0/0\n`;
            script += `}\n`;
            parentsMade.push(parent);
        }

        const commentPart = comment !== "" ? ` comment="${comment}"` : "";

        if (parent) {
            script += `:if ([:len [/queue simple find name="${name}"]] = 0) do={\n`;
            script += `  /queue simple add name="${name}" target=${ip}/32 max-limit=${speed} parent="${parent}"${commentPart}\n`;
            script += `} else={\n`;
            script += `  /queue simple set [find name="${name}"] target=${ip}/32 max-limit=${speed} parent="${parent}"${commentPart}\n`;
            script += `}\n\n`;
        } else {
            script += `:if ([:len [/queue simple find name="${name}"]] = 0) do={\n`;
            script += `  /queue simple add name="${name}" target=${ip}/32 max-limit=${speed}${commentPart}\n`;
            script += `} else={\n`;
            script += `  /queue simple set [find name="${name}"] target=${ip}/32 max-limit=${speed}${commentPart}\n`;
            script += `}\n\n`;
        }
    });

    return script;
};