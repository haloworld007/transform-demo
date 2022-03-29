import { useState } from 'react';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { ISchema, Schema } from '@formily/react';
import Editor from '@monaco-editor/react';
import { SCHEMA } from './const';
import { buildImport, buildState, buildPage, renderProp } from './helper';
import { useEffect } from 'react';
import './index.less';
interface IVar {
  name: string; // 变量名
  dataType: 'string' | 'number' | 'boolean' | 'array' | 'object' | string; // 变量数据类型
  varType: 'state' | 'params';
  initialValue?: string | number | boolean | object | Array<any>; // 初始值
}

/**
 * 根据变量名
 * @param data 变量数据
 */
const getVarInitialValue = (data: IVar) => {
  const { dataType, initialValue } = data;
  if (dataType === 'string') return t.stringLiteral(String(initialValue));
  return t.identifier(String(initialValue));
};

export default function IndexPage() {
  const [code, setCode] = useState('');
  const [json, setJson] = useState(JSON.stringify(SCHEMA, undefined, 2));

  useEffect(() => {
    try {
      const ast = parser.parseExpression(json, {
        sourceType: 'module',
      });
      const importArr: t.Statement[] = [];
      traverse(ast, {
        noScope: true,
        ObjectProperty(path) {
          const keyPath = path.get('key');
          const valuePath = path.get('value');
          if (
            (keyPath.isStringLiteral({ value: 'componentsMap' }) ||
              keyPath.isStringLiteral({ value: 'utilsMap' })) &&
            valuePath.isArrayExpression()
          ) {
            path.skip(); // 跳过遍历子节点
            const { elements } = valuePath.node;
            // 遍历elements生成import语句
            elements.forEach((item) => {
              if (t.isObjectExpression(item)) {
                let source = '';
                let importName = '';
                let destructuring = false;
                for (const prop of item.properties) {
                  const { key, value: propVal } = prop as t.ObjectProperty;
                  const { value: keyVal } = key as t.StringLiteral;
                  const { value } = propVal as
                    | t.StringLiteral
                    | t.BooleanLiteral;
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
                importArr.push(importAst);
              }
            });
          } else if (
            keyPath.isStringLiteral({ value: 'page' }) &&
            valuePath.isObjectExpression()
          ) {
            path.skip(); // 跳过遍历子节点
            // 还原这个对象表达式，更容易操作
            const obj: ISchema = JSON.parse(generate(valuePath.node).code);
            if (obj['x-component'] !== 'Page') {
              throw new Error('root component must be Page');
            }
            if (Array.isArray(obj['x-data']?.['vars'])) {
              const vars: IVar[] = obj['x-data']['vars'];
              // 变量Page下定义的变量，写state
              const stateArr = vars
                .filter((item) => item.varType === 'state')
                .map((item) => {
                  const stateAst = buildState({
                    state: t.identifier(
                      `[${item.name}, set${
                        item.name[0].toUpperCase() + item.name.slice(1)
                      }]`,
                    ),
                    initialValue: getVarInitialValue(item),
                  }) as t.Statement;
                  return stateAst;
                });
              // 利用properties写jsx
              const schema = new Schema(obj);
              const pageChildren = schema.mapProperties((prop) =>
                renderProp(prop),
              );
              const jsxAst = t.jSXElement(
                t.jsxOpeningElement(t.jSXIdentifier('Page'), []),
                t.jsxClosingElement(t.jSXIdentifier('Page')),
                [...pageChildren],
              );
              const ast = buildPage({
                state: stateArr,
                jsx: jsxAst,
              }) as t.Statement;
              const importCode = importArr.reduce((prev, cur) => {
                return prev + generate(cur).code + '\n';
              }, '');
              setCode(`${importCode}
  ${generate(ast).code}`);
            }
          }
        },
      });
    } catch (e) {
      console.error(e);
    }
  }, [json]);

  return (
    <div className="wrapper">
      <Editor
        height={600}
        width={600}
        language="json"
        theme="vs-dark"
        value={json}
        onChange={(val) => setJson(val || '')}
      />
      <Editor
        width={800}
        height={600}
        language="javascript"
        theme="vs-dark"
        value={code}
      />
    </div>
  );
}
