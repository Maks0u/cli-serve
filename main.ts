import { assert } from '@std/assert';
import { parseArgs } from '@std/cli/parse-args';
import { default as config } from './deno.json' with { type: 'json' };
const { name, version } = config;

const args = parseArgs(Deno.args, {
    alias: {
        h: 'help',
        p: 'port',
        v: 'version',
    },
    boolean: ['help', 'version'],
    default: {
        help: false,
        hostname: 'localhost',
        port: '8080',
        version: false,
    },
    string: ['hostname', 'port'],
});

if (args.version) {
    console.log(`${name} ${version}
using deno ${Deno.version.deno}`);
    Deno.exit();
}

if (args.help) {
    console.log(`Serve static files over HTTP

Usage: deno ./main.ts [options] [path]

Options
    -h, --help      Show this help message and exit
    -p, --port      Port to listen on (default: 8080)
    --hostname      Hostname to listen on (default: localhost)`);
    Deno.exit();
}

const { hostname, port } = args;
const ROOT = `${args._[0] ?? './static'}`;

const allowNet = await Deno.permissions.request({ name: 'net', host: `${hostname}:${port}` });
assert(allowNet.state === 'granted', 'Network permission is required');
const allowRead = await Deno.permissions.request({ name: 'read', path: ROOT });
assert(allowRead.state === 'granted', 'Read permission is required');

function getFilePath(req: Request): string {
    const url = new URL(req.url);
    let filepath = decodeURIComponent(url.pathname.slice(1)) || 'index.html';
    if (filepath.endsWith('/')) {
        filepath += 'index.html';
    }
    return `${ROOT}/${filepath}`;
}

function redirectDirectory(req: Request): Response {
    return new Response('', {
        status: 302,
        headers: { Location: `${new URL(req.url).pathname}/` },
    });
}

async function handleRequest(req: Request): Promise<Response> {
    try {
        const file = await Deno.open(getFilePath(req), { read: true });
        if ((await file.stat()).isDirectory) {
            return redirectDirectory(req);
        }
        return new Response(file.readable);
    } catch (error) {
        const status = error instanceof Deno.errors.NotFound || Deno.errors.NotADirectory ? 404 : 500;
        return new Response('', { status });
    }
}

function log(req: Request, res: Response): void {
    console.log(`[${new Date().toLocaleTimeString()}] ${getFilePath(req).slice(ROOT.length)} - ${res.status}`);
}

Deno.serve(
    {
        hostname,
        port: Number.parseInt(port),
        onListen: () => console.log(`\nServing "${ROOT}" folder on http://${hostname}:${port}\n`),
    },
    async (req: Request) => {
        const res = await handleRequest(req);
        log(req, res);
        return res;
    }
);
