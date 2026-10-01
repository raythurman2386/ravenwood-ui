import { readFile } from "node:fs/promises"
import path from "node:path"

type RouteContext = {
  params: Promise<{ name: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { name } = await context.params
  const file = name.endsWith(".json") ? name : `${name}.json`

  if (!/^[\w.-]+\.json$/.test(file)) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const body = await readFile(path.join(process.cwd(), "public", "r", file), "utf8")
    return new Response(body, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    })
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 })
  }
}
