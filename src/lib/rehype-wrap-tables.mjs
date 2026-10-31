/**
 * 把 Markdown 里的 <table> 包进 <div class="table-scroll">，
 * 让宽表在窄屏里横向滚动，而不是把整页撑宽。
 *
 * 不依赖 unist 工具包，手动走一遍 hast 树即可。
 */
export default function rehypeWrapTables() {
  return (tree) => {
    const walk = (node) => {
      if (!node.children) return;

      for (let index = 0; index < node.children.length; index += 1) {
        const child = node.children[index];

        if (child.type === 'element' && child.tagName === 'table') {
          node.children[index] = {
            type: 'element',
            tagName: 'div',
            properties: { className: ['table-scroll'] },
            children: [child],
          };
          continue;
        }

        walk(child);
      }
    };

    walk(tree);
  };
}
