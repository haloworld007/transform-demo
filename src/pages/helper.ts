import template from '@babel/template';
import { ISchema, Schema } from '@formily/react';
import * as t from '@babel/types';

export const buildImport = template(`
  import %%importName%% from %%source%%;
`);

export const buildState = template(`
  const %%state%% = useState(%%initialValue%%);
`);

export const buildPage = template(`
  export const MyPage = () => {
    %%state%%

    return <Page>
      %%jsx%%
    </Page>
  }
`);

export const renderProp = (prop: Schema): t.JSXElement | t.JSXText => {
  const compName: string = prop['x-component'];
  const attrs: t.JSXAttribute[] = [];
  if (Array.isArray(prop['x-data']?.['actions'])) {
    const actions = prop['x-data']['actions'];
    for (const action of actions) {
      const { eventName, handler } = action;
      const attr = t.jSXAttribute(
        t.jSXIdentifier(eventName),
        t.jSXExpressionContainer(
          t.arrowFunctionExpression(
            [],
            t.blockStatement([
              t.expressionStatement(
                t.callExpression(t.identifier(handler.name), []),
              ),
            ]),
          ),
        ),
      );
      attrs.push(attr);
    }
  }
  const children = prop.mapProperties((item) => renderProp(item));
  if (prop['x-content']) {
    children.unshift(t.jSXText(String(prop['x-content'])));
  }
  return t.jSXElement(
    t.jsxOpeningElement(t.jSXIdentifier(compName), [...attrs]),
    t.jsxClosingElement(t.jSXIdentifier(compName)),
    [...children],
  );
};
