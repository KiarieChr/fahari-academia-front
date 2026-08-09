const fs = require('fs');
const path = require('path');

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const p = path.join(dir, file);
        if (fs.statSync(p).isDirectory()) {
            walk(p);
        } else if (p.endsWith('.js') || p.endsWith('.jsx') || p.endsWith('.ts') || p.endsWith('.tsx')) {
            let c = fs.readFileSync(p, 'utf-8');
            let orig = c;
            
            c = c.replace(/process\.env\.NEXT_PUBLIC_/g, 'import.meta.env.VITE_');
            c = c.replace(/process\.env\.NODE_ENV/g, 'import.meta.env.MODE');
            
            if (c !== orig) {
                fs.writeFileSync(p, c);
                console.log('Fixed ' + p);
            }
        }
    });
}

walk('./src');
