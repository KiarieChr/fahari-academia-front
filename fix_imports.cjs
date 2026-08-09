const fs = require('fs');
const path = require('path');

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const p = path.join(dir, file);
        if (fs.statSync(p).isDirectory()) {
            walk(p);
        } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
            let c = fs.readFileSync(p, 'utf-8');
            let orig = c;
            
            c = c.replace(/import\s*\{\s*useRouter(?:,\s*usePathname)?\s*\}\s*from\s*['"]next\/navigation['"];?/g, 'import { useNavigate, useLocation } from "react-router-dom";');
            c = c.replace(/import\s*Link\s*from\s*['"]next\/link['"];?/g, 'import { Link } from "react-router-dom";');
            c = c.replace(/const\s+router\s*=\s*useRouter\(\);/g, 'const navigate = useNavigate();');
            c = c.replace(/const\s+pathname\s*=\s*usePathname\(\);/g, 'const location = useLocation(); const pathname = location.pathname;');
            c = c.replace(/router\.push\(/g, 'navigate(');
            c = c.replace(/<Link([^>]+)href=/g, '<Link$1to=');
            
            if (c !== orig) {
                fs.writeFileSync(p, c);
                console.log('Fixed ' + p);
            }
        }
    });
}

walk('./src');
