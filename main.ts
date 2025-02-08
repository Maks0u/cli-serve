import { parseArgs } from '@std/cli/parse-args';
import { STATUS_CODE, STATUS_TEXT } from '@std/http/status';

const args = parseArgs(Deno.args, {
    alias: {
        h: 'help',
        p: 'port',
    },
    default: {
        help: false,
        host: 'localhost',
        port: '8080',
    },
    string: ['host', 'port'],
});

if (args.help) {
    console.log(`
Usage: deno ./main.ts [options] [path]
    Options:
        -h, --help      Show this help message and exit
        -p, --port      Port to listen on (default: 8080)
        --host          Hostname to listen on (default: localhost)
    `);
    Deno.exit();
}

const { host: hostname, port } = args;
const rootPath = args._[0] ?? './static';

const onListen = () => {
    console.log(`Serving ${rootPath} folder on http://${hostname}:${port}`);
};

Deno.serve({ hostname, port: Number.parseInt(port), onListen }, async request => {
    const url = new URL(request.url);
    const filepath = decodeURIComponent(url.pathname.slice(1)) || 'index.html';
    console.log(filepath);

    try {
        const file = await Deno.open(`${rootPath}/${filepath}`, { read: true });
        return new Response(file.readable);
    } catch {
        const status = STATUS_CODE.NotFound;
        return new Response(STATUS_TEXT[status], { status });
    }
});
