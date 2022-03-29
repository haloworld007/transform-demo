import template from '@babel/template';

export const buildImport = template(`
  import %%importName%% from %%source%%;
`);

export const buildState = template(`
  const %%state%% = useState(%%initialValue%%);
`);

export const buildPage = template(`
  export const MyPage = () => {
    %%state%%

    return %%jsx%%
  }
`);
