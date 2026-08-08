import { slugify, gcdArray } from '../mathHelpers';

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