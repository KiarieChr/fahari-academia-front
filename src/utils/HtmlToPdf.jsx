import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    p: { fontSize: 9.5, lineHeight: 1.8, color: '#334155', marginBottom: 7 },
    strong: { fontFamily: 'Helvetica-Bold' },
    em: { fontFamily: 'Helvetica-Oblique' },
    u: { textDecoration: 'underline' },
    s: { textDecoration: 'line-through' },
    ul: { marginLeft: 8, marginBottom: 7 },
    li: { flexDirection: 'row', marginBottom: 3 },
    bullet: { width: 12, fontSize: 9 },
    liText: { flex: 1, fontSize: 9, lineHeight: 1.7, color: '#475569' },
});

export const HtmlToPdf = ({ html }) => {
    if (!html || typeof window === 'undefined') return null;
    
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    const renderNode = (node, i) => {
        if (node.nodeType === Node.TEXT_NODE) {
            // React-pdf Text components automatically handle whitespace, but we shouldn't return empty strings
            return node.textContent.trim() === '' ? ' ' : node.textContent;
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            const children = Array.from(node.childNodes).map((child, j) => renderNode(child, j));
            
            switch (tagName) {
                case 'p':
                    return <Text key={i} style={styles.p}>{children}</Text>;
                case 'strong':
                case 'b':
                    return <Text key={i} style={styles.strong}>{children}</Text>;
                case 'em':
                case 'i':
                    return <Text key={i} style={styles.em}>{children}</Text>;
                case 'u':
                    return <Text key={i} style={styles.u}>{children}</Text>;
                case 's':
                case 'strike':
                    return <Text key={i} style={styles.s}>{children}</Text>;
                case 'ul':
                case 'ol':
                    return <View key={i} style={styles.ul}>{children}</View>;
                case 'li':
                    return (
                        <View key={i} style={styles.li}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.liText}>{children}</Text>
                        </View>
                    );
                case 'br':
                    return <Text key={i}>{'\n'}</Text>;
                default:
                    // Fallback for unknown tags (just render children)
                    return <Text key={i}>{children}</Text>;
            }
        }
        return null;
    };
    
    return <View>{Array.from(doc.body.childNodes).map((node, i) => renderNode(node, i))}</View>;
};
