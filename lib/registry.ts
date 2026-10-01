export const githubUser = "raythurman2386"
export const githubRepo = "ravenwood-ui"
export const registryNamespace = "@ravenwood"

export const registryItemUrl = `https://raw.githubusercontent.com/${githubUser}/${githubRepo}/main/public/r/{name}.json`

export function installCommand(name: string) {
  return `npx shadcn@latest add ${registryNamespace}/${name}`
}

export function githubInstallCommand(name: string) {
  return `npx shadcn@latest add ${githubUser}/${githubRepo}/${name}`
}
