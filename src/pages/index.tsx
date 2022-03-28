import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import template from '@babel/template';
import { SCHEMA } from './const';
import styles from './index.less';

const buildImport = template(`
  import %%importName%% from %%source%%;
`);

export default function IndexPage() {
  const ast = parser.parseExpression(JSON.stringify(SCHEMA), {
    sourceType: 'module',
  });
  traverse(ast, {
    noScope: true,
    ObjectProperty(path) {
      const keyPath = path.get('key');
      const valuePath = path.get('value');
      if (
        keyPath.isStringLiteral({ value: 'componentsMap' }) &&
        valuePath.isArrayExpression()
      ) {
        path.skip(); // 跳过遍历子节点
        const { elements } = valuePath.node;
        // 遍历elements生成import语句
        const importArr = elements.map((item) => {
          if (t.isObjectExpression(item)) {
            let source = '';
            let importName = '';
            let destructuring = false;
            for (const prop of item.properties) {
              const { key, value: propVal } = prop as t.ObjectProperty;
              const { value: keyVal } = key as t.StringLiteral;
              const { value } = propVal as t.StringLiteral | t.BooleanLiteral;
              if (keyVal === 'package') {
                source = String(value);
                continue;
              }
              if (keyVal === 'name') {
                // 包名
                importName = String(value);
                continue;
              }
              if (keyVal === 'destructuring') {
                destructuring = Boolean(value);
              }
            }
            if (destructuring) {
              importName = `{ ${importName} }`;
            }
            const importAst = buildImport({
              importName: t.identifier(importName),
              source: t.stringLiteral(source),
            }) as t.Statement;
            return generate(importAst).code;
          }
        });
      } else if (keyPath.isStringLiteral({ value: 'page' })) {
        path.skip(); // 跳过遍历子节点
        // 遍历schema
        console.log(valuePath);
      }
    },
  });
  return <div>hello world</div>;
}
