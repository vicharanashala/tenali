import React from 'react';

const findElementWithClass = (node, className) => {
    if (!node || !React.isValidElement(node)) return null;
    if (node.props && node.props.className && typeof node.props.className === 'string' && node.props.className.includes(className)) {
        return node;
    }
    if (node.props && node.props.children) {
        const children = React.Children.toArray(node.props.children);
        for (const child of children) {
        const found = findElementWithClass(child, className);
        if (found) return found;
        }
    }
    return null;
};

const findElementByType = (node, typeName) => {
    if (!node || !React.isValidElement(node)) return null;
    if (node.type === typeName || (node.type && node.type.name === typeName)) {
        return node;
    }
    if (node.props && node.props.children) {
        const children = React.Children.toArray(node.props.children);
        for (const child of children) {
        const found = findElementByType(child, typeName);
        if (found) return found;
        }
    }
    return null;
    };

const findAllElementsByType = (node, type) => {
    if (!node || !React.isValidElement(node)) return [];
    let found = [];
    if (node.type === type) {
        found.push(node);
    }
    if (node.props && node.props.children) {
        const children = React.Children.toArray(node.props.children);
        for (const child of children) {
        found = found.concat(findAllElementsByType(child, type));
        }
    }
    return found;
};

const getNodeText = (node) => {
    if (!node) return '';
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(getNodeText).join('');
    if (node.props && node.props.children) {
        return getNodeText(node.props.children);
    }
    return '';
};


export { findAllElementsByType, findElementByType, findElementWithClass, getNodeText };

