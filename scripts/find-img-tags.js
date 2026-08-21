#!/usr/bin/env node

/**
 * Script to find all <img> tags in the frontend codebase and list them for manual conversion to LazyImage
 * Run: node find-img-tags.js
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const results = [];

function findImgTags(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        // Skip node_modules and dist
        if (file === 'node_modules' || file === 'dist' || file.startsWith('.')) {
            return;
        }

        if (stat.isDirectory()) {
            findImgTags(filePath);
        } else if (file.endsWith('.jsx') || file.endsWith('.tsx')) {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            lines.forEach((line, index) => {
                if (line.includes('<img')) {
                    results.push({
                        file: filePath.replace(srcDir, 'src'),
                        line: index + 1,
                        code: line.trim(),
                    });
                }
            });
        }
    });
}

console.log('🔍 Scanning for <img> tags...\n');
findImgTags(srcDir);

if (results.length === 0) {
    console.log('✅ No <img> tags found! All images are already optimized.');
} else {
    console.log(`Found ${results.length} <img> tags:\n`);
    console.log('─'.repeat(100));
    
    results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.file}:${result.line}`);
        console.log(`   ${result.code.substring(0, 80)}${result.code.length > 80 ? '...' : ''}`);
        console.log();
    });

    console.log('─'.repeat(100));
    console.log(`\n📝 Conversion Guide:\n`);
    console.log('OLD:');
    console.log('<img src="/path/to/image.jpg" alt="Description" className="w-32 h-32" />\n');
    console.log('NEW:');
    console.log('import LazyImage from "../path/to/LazyImage";\n');
    console.log('<LazyImage');
    console.log('  src="/path/to/image.jpg"');
    console.log('  alt="Description"');
    console.log('  aspectRatio="aspect-square"');
    console.log('  className="w-32 h-32"');
    console.log('/>');
}
