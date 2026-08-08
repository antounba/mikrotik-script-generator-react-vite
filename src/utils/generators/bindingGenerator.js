// Generator IP Binding (Hotspot & DHCP Only)

export const generateBindingScript = (bindings, isHotspot = true) => {
    let script = "";
    const parents = {};

    bindings.forEach((b) => {
        const speed = `${b.upload}${b.upload_unit}/${b.download}${b.download_unit}`;
        const iface = b.iface || "bridge";
        const ip = b.ip;
        const mac = (b.mac || "").toUpperCase();
        const name = (b.name || "").toUpperCase();
        const clientId = `1:${(b.mac || "").toLowerCase()}`;
        const parent = (b.parent || "").toUpperCase();

        // ARP & DHCP Lease
        script += `/ip arp add address=${ip} mac-address=${mac} interface=${iface} comment="${name}"\n`;
        script += `/ip dhcp-server lease add address=${ip} mac-address=${mac} client-id="${clientId}" comment="${name}"\n`;

        // HOTSPOT IP BINDING
        if (isHotspot) {
            script += `/ip hotspot ip-binding add address=${ip} to-address=${ip} mac-address=${mac} type=bypassed comment="${name}"\n`;
        }

        // PARENT QUEUE
        if (parent && !parents[parent]) {
            script += `:if ([:len [/queue simple find name="${parent}"]] = 0) do={\n`;
            script += `  /queue simple add name="${parent}" max-limit=0/0\n`;
            script += `}\n\n`;
            parents[parent] = true;
        }

        // AUTO TAMBAH IP KE PARENT TARGET
        if (parent) {
            script += `:local t [/queue simple get [find name="${parent}"] target];\n`;
            script += `:local new "${ip}/32";\n`;
            script += `:local final "";\n`;
            script += `:if ($t = "") do={\n`;
            script += `    /queue simple set [find name="${parent}"] target=$new;\n`;
            script += `} else={\n`;
            script += `    :foreach a in=[split $t ","] do={\n`;
            script += `        :set a [:trim $a];\n`;
            script += `        :if (($a != "") && ($a != $new)) do={\n`;
            script += `            :set final ($final . "," . $a);\n`;
            script += `        }\n`;
            script += `    }\n`;
            script += `    :set final ($final . "," . $new);\n`;
            script += `    :set final [:pick $final 1 [:len $final]];\n`;
            script += `    /queue simple set [find name="${parent}"] target=$final;\n`;
            script += `}\n\n`;
        }

        // CHILD QUEUE
        if (parent) {
            script += `:if ([:len [/queue simple find name="${name}"]] = 0) do={\n`;
            script += `  /queue simple add name="${name}" target=${ip}/32 max-limit=${speed} parent="${parent}"\n`;
            script += `} else={\n`;
            script += `  /queue simple set [find name="${name}"] target=${ip}/32 max-limit=${speed} parent="${parent}"\n`;
            script += `}\n\n`;
        } else {
            script += `:if ([:len [/queue simple find name="${name}"]] = 0) do={\n`;
            script += `  /queue simple add name="${name}" target=${ip}/32 max-limit=${speed}\n`;
            script += `} else={\n`;
            script += `  /queue simple set [find name="${name}"] target=${ip}/32 max-limit=${speed}\n`;
            script += `}\n\n`;
        }
    });

    return script;
};

export const generateEditBindingScript = (editData, isHotspot = true) => {
    let script = "";
    editData.forEach((e) => {
        const ip = e.ip;
        const mac = (e.mac || "").toUpperCase();
        if (ip && mac) {
            script += `/ip arp set [find address=${ip}] mac-address=${mac}\n`;
            script += `/ip dhcp-server lease set [find address=${ip}] mac-address=${mac}\n`;
            if (isHotspot) {
                script += `/ip hotspot ip-binding set [find address=${ip}] mac-address=${mac}\n`;
            }
            script += `\n`;
        }
    });
    return script;
};

export const generateHapusBindingScript = (hapusData, isHotspot = true) => {
    let script = "";
    hapusData.forEach((h) => {
        const ip = h.ip;
        if (ip) {
            script += `/ip arp remove [find address=${ip}]\n`;
            script += `/ip dhcp-server lease remove [find address=${ip}]\n`;
            if (isHotspot) {
                script += `/ip hotspot ip-binding remove [find address=${ip}]\n`;
            }
            script += `/queue simple remove [find target=${ip}/32]\n\n`;
        }
    });
    return script;
};