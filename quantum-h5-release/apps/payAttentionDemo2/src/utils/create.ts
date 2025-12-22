export type Mod = string | { [key: string]: string | boolean | number };
export type Mods = Mod | Mod[];
function genBem(name: string, mods?: Mods): string {
  if (!mods) {
    return '';
  }


  if (typeof mods === 'string') {
    return ` ${name}-${mods}`;
  }

  if (Array.isArray(mods)) {
    return (mods as Mod[]).reduce<string>(
      (ret, item) => ret + genBem(name, item),
      '',
    );
  }

  return Object.keys(mods).reduce(
    (ret, key) => ret + (mods[key] ? genBem(name, key) : ''),
    '',
  );
}
export function createBEM(name: string) {
  return (el?: Mods, mods?: Mods): Mods => {
    if (el && typeof el !== 'string') {
      mods = el;
      el = '';
    }

    el = el ? `${name}_${el}` : name;

    return `${el}${genBem(el, mods)}`;
  };
}

export function createNamespace(name: string) {
  const prefixedName = `q-${name}`;
  return [
    prefixedName,
    createBEM(prefixedName),
  ] as const;
}