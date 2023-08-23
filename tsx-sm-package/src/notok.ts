

export async function foo() {
  throw new Error('x')
  // @ts-expect-error ignore the name of the imported package
  const bar = ( await import('some-package') ).default
}

export {}
