// Helper Slugify & FPB (GCD)
const slugify = (str) => {
    if (!str) return 'unnamed';
    return str.trim().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/gu, '_') || 'unnamed';
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const gcdArray = (arr) => arr.reduce((acc, val) => gcd(acc, val));

// ==========================================
// 1. GENERATOR IP BINDING (HOTSPOT & DHCP)
// ==========================================

// TAMBAH DEVICE
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

        // HOTSPOT IP BINDING (Jika mode Hotspot aktif)
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

// EDIT MAC ADDRESS
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

// HAPUS DEVICE
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

// ==========================================
// 2. GENERATE PCC LOAD BALANCE
// ==========================================
export const generatePCCScript = (modems, version = 6, lan = "bridge") => {
    if (!modems || modems.length === 0) return "# No modems defined.\n";

    const bandwidths = modems.map((m) => Math.max(1, parseInt(m.bandwidth) || 1));
    const total = bandwidths.reduce((a, b) => a + b, 0);
    const gcdVal = gcdArray(bandwidths);
    const divisor = Math.max(1, Math.floor(total / gcdVal));

    let script = `# ==============================\n# Script PCC Load Balance\n# RouterOS Version: v${version}\n# ==============================\n\n`;

    script += `/ip firewall mangle\n`;
    let index = 0;
    modems.forEach((m, i) => {
        const nameRaw = m.name || `ISP${i}`;
        const safe = slugify(nameRaw);
        const bw = Math.max(1, parseInt(m.bandwidth) || 1);
        const share = Math.floor((bw / total) * divisor) || 1;

        script += `# ${nameRaw} (${bw} Mbps) -> ${share}/${divisor} koneksi\n`;
        for (let j = 0; j < share; j++) {
            script += `add chain=prerouting dst-address-type=!local in-interface=${lan} per-connection-classifier=src-address:${divisor}/${index} action=mark-connection new-connection-mark="${safe}_conn" passthrough=yes\n`;
            index++;
        }
        script += `\n`;
    });

    script += `# Mark Routing sesuai koneksi\n`;
    modems.forEach((m) => {
        const safe = slugify(m.name);
        script += `add chain=prerouting in-interface=${lan} connection-mark="${safe}_conn" action=mark-routing new-routing-mark="to_${safe}" passthrough=yes\n`;
    });

    if (parseInt(version) === 6) {
        script += `\n# --- IP Route (RouterOS v6) ---\n/ip route\n`;
        modems.forEach((m) => {
            const safe = slugify(m.name);
            script += `add gateway=${m.gateway} routing-mark="to_${safe}" check-gateway=ping\n`;
        });
    } else {
        script += `\n# --- Routing Table (RouterOS v7) ---\n/routing table\n`;
        modems.forEach((m) => {
            const safe = slugify(m.name);
            script += `add name="to_${safe}" fib=no\n`;
        });

        script += `\n# --- IP Route (RouterOS v7) ---\n/ip route\n`;
        modems.forEach((m) => {
            const safe = slugify(m.name);
            script += `add dst-address=0.0.0.0/0 gateway=${m.gateway} routing-table="to_${safe}" check-gateway=ping\n`;
        });
    }

    return script.replace(/\n{3,}/g, "\n\n");
};

// ==========================================
// 3. GENERATE SIMPLE QUEUE
// ==========================================
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